<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Client;
use App\Models\Contrat;
use App\Models\Paiement;
use App\Models\Reservation;
use App\Models\User;
use App\Models\Vehicule;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index(): JsonResponse
    {
        $user = auth()->user();

        if ($user->isClient())   return $this->dashboardClient();
        if ($user->isEmployee()) return $this->dashboardEmploye();

        return $this->dashboardStaff();
    }

    public function rapportEmployes(): JsonResponse
    {
        abort_if(!auth()->user()->isAdmin(), 403);

        $debut = now()->startOfMonth();

        $employes = User::whereIn('role', ['administrateur', 'employe'])
            ->get()
            ->map(function (User $u) use ($debut) {
                $nbReservations = Reservation::where('employe_id', $u->id)
                    ->where('created_at', '>=', $debut)->count();

                $nbContrats = Contrat::where('employe_id', $u->id)
                    ->where('created_at', '>=', $debut)->count();

                $ca = Paiement::where('employe_id', $u->id)
                    ->where('statut', 'valide')
                    ->where('created_at', '>=', $debut)
                    ->sum('montant');

                $nbRetours = \App\Models\Retour::where('employe_id', $u->id)
                    ->where('created_at', '>=', $debut)->count();

                return [
                    'id'              => $u->id,
                    'nom'             => $u->prenom . ' ' . $u->name,
                    'email'           => $u->email,
                    'role'            => $u->role,
                    'nb_reservations' => $nbReservations,
                    'nb_contrats'     => $nbContrats,
                    'nb_retours'      => $nbRetours,
                    'ca_genere'       => (float) $ca,
                    'last_login_at'   => $u->last_login_at,
                ];
            });

        return response()->json(['employes' => $employes, 'mois' => $debut->isoFormat('MMMM YYYY')]);
    }

    private function dashboardStaff(): JsonResponse
    {
        $today      = now()->startOfDay();
        $debutMois  = now()->startOfMonth();

        $parcTotal  = Vehicule::count();
        $parcLoues  = Vehicule::where('statut', 'loue')->count();
        $parcMaint  = Vehicule::where('statut', 'en_maintenance')->count();

        $caJournalier = Paiement::where('statut', 'valide')
            ->whereDate('date_paiement', today())
            ->sum('montant');

        $caMensuel = Paiement::where('statut', 'valide')
            ->whereBetween('date_paiement', [$debutMois, now()])
            ->sum('montant');

        $reservationsActives = Reservation::whereIn('statut', ['confirmee', 'en_cours'])->count();
        $reservationsAujourd = Reservation::whereDate('date_debut', today())->count();

        $annulations = Reservation::where('statut', 'annulee')
            ->where('created_at', '>=', $debutMois)
            ->count();
        $totalMois = Reservation::where('created_at', '>=', $debutMois)->count();
        $tauxAnnulation = $totalMois > 0 ? round(($annulations / $totalMois) * 100, 1) : 0;

        $scoresMoyen = Client::avg('score_fiabilite');

        $obligationsAlertes = Vehicule::whereNotIn('statut', ['hors_service'])
            ->get()
            ->filter(function (Vehicule $v) {
                $o = $v->statutObligations();
                return collect($o)->contains(fn ($s) => in_array($s, ['a_prevoir', 'en_retard']));
            })
            ->count();

        // CA par mois (6 derniers mois)
        $caMoisParMois = Paiement::where('statut', 'valide')
            ->where('created_at', '>=', now()->subMonths(6))
            ->select(
                DB::raw("TO_CHAR(date_paiement, 'YYYY-MM') as mois"),
                DB::raw('SUM(montant) as total')
            )
            ->groupBy('mois')
            ->orderBy('mois')
            ->get();

        // Véhicules les plus loués
        $topVehicules = Reservation::whereIn('statut', ['terminee', 'en_cours'])
            ->select('vehicule_id', DB::raw('COUNT(*) as nb_locations'))
            ->with('vehicule:id,marque,modele,immatriculation')
            ->groupBy('vehicule_id')
            ->orderByDesc('nb_locations')
            ->limit(5)
            ->get();

        // Distribution segments clients
        $segmentsClients = Client::select('segment', DB::raw('COUNT(*) as total'))
            ->groupBy('segment')
            ->get();

        return response()->json([
            'kpi' => [
                'taux_occupation'        => $parcTotal > 0 ? round(($parcLoues / $parcTotal) * 100, 1) : 0,
                'parc_total'             => $parcTotal,
                'parc_loues'             => $parcLoues,
                'parc_maintenance'       => $parcMaint,
                'ca_journalier'          => $caJournalier,
                'ca_mensuel'             => $caMensuel,
                'reservations_actives'   => $reservationsActives,
                'reservations_aujd'      => $reservationsAujourd,
                'taux_annulation'        => $tauxAnnulation,
                'score_moyen_clients'    => round($scoresMoyen ?? 0, 1),
                'alertes_obligations'    => $obligationsAlertes,
            ],
            'graphiques' => [
                'ca_mensuel'       => $caMoisParMois,
                'top_vehicules'    => $topVehicules,
                'segments_clients' => $segmentsClients,
            ],
        ]);
    }

    private function dashboardEmploye(): JsonResponse
    {
        $uid   = auth()->id();
        $debut = now()->startOfMonth();
        $today = now()->startOfDay();

        $mesReservations = Reservation::where('employe_id', $uid)
            ->whereIn('statut', ['en_attente', 'confirmee', 'en_cours'])
            ->with(['client.user', 'vehicule'])
            ->orderBy('date_debut')
            ->limit(10)
            ->get();

        $reservationsAujourdHui = Reservation::where('employe_id', $uid)
            ->where(function ($q) use ($today) {
                $q->whereDate('date_debut', today())
                  ->orWhereDate('date_fin', today());
            })
            ->with(['client.user', 'vehicule'])
            ->get();

        $enAttente = Reservation::where('statut', 'en_attente')
            ->with(['client.user', 'vehicule'])
            ->orderBy('created_at')
            ->limit(5)
            ->get();

        $caPersonnel = Paiement::where('employe_id', $uid)
            ->where('statut', 'valide')
            ->where('created_at', '>=', $debut)
            ->sum('montant');

        $nbContratsPersonnel = Contrat::where('employe_id', $uid)
            ->where('created_at', '>=', $debut)
            ->count();

        return response()->json([
            'type'                   => 'employe',
            'mes_reservations'       => $mesReservations,
            'reservations_aujd'      => $reservationsAujourdHui,
            'en_attente'             => $enAttente,
            'ca_personnel'           => (float) $caPersonnel,
            'nb_contrats_personnel'  => $nbContratsPersonnel,
        ]);
    }

    private function dashboardClient(): JsonResponse
    {
        $client = auth()->user()->client;

        if (!$client) {
            return response()->json(['message' => 'Profil client introuvable.'], 404);
        }

        $reservationsActives = $client->reservations()
            ->whereIn('statut', ['en_attente', 'confirmee', 'en_cours'])
            ->with('vehicule')
            ->orderBy('date_debut')
            ->get();

        $historiqueRecent = $client->reservations()
            ->where('statut', 'terminee')
            ->with(['vehicule', 'contrat.paiements'])
            ->orderByDesc('date_fin')
            ->limit(5)
            ->get();

        $totalDepense = Paiement::whereHas('contrat.reservation', fn ($q) =>
            $q->where('client_id', $client->id)
        )->where('statut', 'valide')->sum('montant');

        return response()->json([
            'score'               => $client->score_fiabilite,
            'segment'             => $client->segment,
            'reservations_actives' => $reservationsActives,
            'historique_recent'   => $historiqueRecent,
            'total_depense'       => $totalDepense,
            'nb_locations'        => $client->reservations()->where('statut', 'terminee')->count(),
        ]);
    }
}
