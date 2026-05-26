<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Client;
use App\Models\Paiement;
use App\Models\Reservation;
use App\Models\Vehicule;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;

class AnalytiqueController extends Controller
{
    private string $aiUrl;

    public function __construct()
    {
        $this->aiUrl = config('services.ai_service.url', 'http://localhost:5001');
    }

    // ── Demand forecast ───────────────────────────────────────────────────────

    public function previsionDemande(Request $request): JsonResponse
    {
        $parcTotal = Vehicule::count();
        $loues     = Vehicule::where('statut', 'loue')->count();
        $taux      = $parcTotal > 0 ? round(($loues / $parcTotal) * 100, 1) : 60;

        $caMoyen = Paiement::where('statut', 'valide')
            ->where('created_at', '>=', now()->subDays(30))
            ->avg('montant') ?? 3000;

        $payload = [
            'parc_total'      => $parcTotal,
            'taux_occupation' => $taux,
            'ca_moyen_jour'   => round($caMoyen),
            'horizon_jours'   => $request->integer('horizon_jours', 30),
        ];

        return $this->forwardToAI('/prevision-demande', $payload);
    }

    // ── Dynamic pricing ───────────────────────────────────────────────────────

    public function tarificationDynamique(Request $request): JsonResponse
    {
        $request->validate([
            'vehicule_id' => 'required|exists:vehicules,id',
            'date_debut'  => 'required|date',
            'date_fin'    => 'required|date|after:date_debut',
        ]);

        $vehicule = Vehicule::findOrFail($request->vehicule_id);

        $parcTotal = Vehicule::count();
        $loues     = Vehicule::where('statut', 'loue')->count();
        $taux      = $parcTotal > 0 ? round(($loues / $parcTotal) * 100, 1) : 60;

        $payload = [
            'tarif_base'      => $vehicule->tarif_journalier,
            'taux_occupation' => $taux,
            'categorie'       => $vehicule->categorie,
            'tarif_min'       => $vehicule->tarif_journalier * 0.7,
            'tarif_max'       => $vehicule->tarif_journalier * 2.0,
            'date_debut'      => $request->date_debut,
            'date_fin'        => $request->date_fin,
        ];

        return $this->forwardToAI('/tarification-dynamique', $payload);
    }

    // ── Client scoring ────────────────────────────────────────────────────────

    public function scoringClient(Request $request): JsonResponse
    {
        $request->validate(['client_id' => 'required|exists:clients,id']);

        $client = Client::with('reservations.contrat.paiements')->findOrFail($request->client_id);

        $reservations  = $client->reservations;
        $terminees     = $reservations->where('statut', 'terminee');
        $annulees      = $reservations->where('statut', 'annulee');

        $retours = DB::table('retours')
            ->join('contrats', 'contrats.id', '=', 'retours.contrat_id')
            ->join('reservations', 'reservations.id', '=', 'contrats.reservation_id')
            ->where('reservations.client_id', $client->id)
            ->select('retours.penalite_retard', 'retours.dommages_constates')
            ->get();

        $nbRetards  = $retours->where('penalite_retard', '>', 0)->count();
        $nbDommages = $retours->where('dommages_constates', true)->count();
        $montant    = Paiement::whereHas('contrat.reservation', fn ($q) =>
            $q->where('client_id', $client->id)
        )->where('statut', 'valide')->sum('montant');

        $anciennete = (int) now()->diffInMonths($client->created_at);

        $payload = [
            'nb_locations'    => $terminees->count(),
            'nb_retards'      => $nbRetards,
            'nb_annulations'  => $annulees->count(),
            'nb_dommages'     => $nbDommages,
            'montant_total'   => $montant,
            'anciennete_mois' => $anciennete,
        ];

        return $this->forwardToAI('/scoring-client', $payload);
    }

    // ── Vehicle recommendation ────────────────────────────────────────────────

    public function recommandationVehicule(Request $request): JsonResponse
    {
        $request->validate([
            'budget_jour'  => 'nullable|numeric|min:0',
            'nb_personnes' => 'nullable|integer|min:1|max:9',
            'usage'        => 'nullable|in:tourisme,affaires,famille,utilitaire',
            'client_id'    => 'nullable|exists:clients,id',
        ]);

        // Historique du client connecté ou fourni
        $clientId = $request->client_id ?? optional(auth()->user()->client)->id;
        $historique = [];
        if ($clientId) {
            $historique = DB::table('reservations')
                ->join('vehicules', 'vehicules.id', '=', 'reservations.vehicule_id')
                ->where('reservations.client_id', $clientId)
                ->where('reservations.statut', 'terminee')
                ->select('vehicules.categorie', 'vehicules.tarif_journalier', DB::raw('count(*) as nb_locations'))
                ->groupBy('vehicules.categorie', 'vehicules.tarif_journalier')
                ->get()->toArray();
        }

        // Véhicules disponibles
        $vehicules = Vehicule::where('statut', 'disponible')
            ->select('id', 'marque', 'modele', 'categorie', 'tarif_journalier', 'nombre_places', 'annee')
            ->withCount(['reservations as nb_locations_total' => fn ($q) => $q->where('statut', 'terminee')])
            ->get()->toArray();

        $payload = [
            'historique'      => $historique,
            'budget_jour'     => $request->float('budget_jour', 999999),
            'nb_personnes'    => $request->integer('nb_personnes', 2),
            'usage'           => $request->string('usage', 'tourisme'),
            'vehicules_dispo' => $vehicules,
        ];

        return $this->forwardToAI('/recommandation-vehicule', $payload);
    }

    // ── KPIs résumé analytique ────────────────────────────────────────────────

    public function resumeAnalytique(): JsonResponse
    {
        $debutMois = now()->startOfMonth();

        $parcTotal  = Vehicule::count();
        $loues      = Vehicule::where('statut', 'loue')->count();
        $taux       = $parcTotal > 0 ? round(($loues / $parcTotal) * 100, 1) : 0;

        // Revenu des 7 derniers jours
        $rev7j = Paiement::where('statut', 'valide')
            ->where('created_at', '>=', now()->subDays(7))
            ->select(DB::raw("DATE(date_paiement) as jour"), DB::raw('SUM(montant) as total'))
            ->groupBy('jour')
            ->orderBy('jour')
            ->get();

        // Distribution scores clients
        $scores = Client::selectRaw('
            COUNT(*) FILTER (WHERE score_fiabilite >= 75) as vip,
            COUNT(*) FILTER (WHERE score_fiabilite >= 40 AND score_fiabilite < 75) as standard,
            COUNT(*) FILTER (WHERE score_fiabilite < 40) as risque
        ')->first();

        // Catégories les + louées
        $topCategories = Reservation::whereIn('statut', ['terminee', 'en_cours'])
            ->join('vehicules', 'vehicules.id', '=', 'reservations.vehicule_id')
            ->select('vehicules.categorie', DB::raw('COUNT(*) as nb'))
            ->groupBy('vehicules.categorie')
            ->orderByDesc('nb')
            ->limit(6)
            ->get();

        return response()->json([
            'taux_occupation'  => $taux,
            'parc_total'       => $parcTotal,
            'rev_7j'           => $rev7j,
            'segments'         => $scores,
            'top_categories'   => $topCategories,
        ]);
    }

    // ── private helper ─────────────────────────────────────────────────────────

    private function forwardToAI(string $endpoint, array $payload): JsonResponse
    {
        try {
            $response = Http::timeout(10)
                ->post("{$this->aiUrl}{$endpoint}", $payload);

            if ($response->successful()) {
                return response()->json($response->json());
            }

            return response()->json(['message' => 'Service IA indisponible', 'details' => $response->body()], 502);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Impossible de joindre le service IA', 'error' => $e->getMessage()], 503);
        }
    }
}
