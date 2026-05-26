<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Contrat;
use App\Models\Paiement;
use App\Models\Reservation;
use App\Models\Vehicule;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;

class PdfController extends Controller
{
    public function contrat(Contrat $contrat): Response
    {
        abort_if(
            auth()->user()->isClient()
            && $contrat->reservation->client_id !== auth()->user()->client?->id,
            403
        );

        $contrat->load([
            'reservation.client.user',
            'reservation.vehicule',
            'employe',
            'paiements',
        ]);

        $pdf = Pdf::loadView('pdf.contrat', ['contrat' => $contrat])
            ->setPaper('a4', 'portrait');

        $filename = 'contrat-' . $contrat->numero_contrat . '.pdf';

        return $pdf->download($filename);
    }

    public function rapportMensuel(Request $request): Response
    {
        abort_if(!auth()->user()->isAdmin() && !auth()->user()->isEmploye(), 403);

        $mois  = (int) $request->get('mois', now()->month);
        $annee = (int) $request->get('annee', now()->year);

        $debut = \Carbon\Carbon::create($annee, $mois, 1)->startOfDay();
        $fin   = $debut->copy()->endOfMonth()->endOfDay();

        $ca = Paiement::where('statut', 'valide')
            ->whereBetween('date_paiement', [$debut, $fin])
            ->sum('montant');

        $reservations = Reservation::whereBetween('date_debut', [$debut, $fin])
            ->select('statut', DB::raw('COUNT(*) as nb'))
            ->groupBy('statut')
            ->pluck('nb', 'statut');

        $topVehicules = Reservation::whereIn('statut', ['terminee', 'en_cours'])
            ->whereBetween('date_debut', [$debut, $fin])
            ->select('vehicule_id', DB::raw('COUNT(*) as nb_locations'), DB::raw('SUM(prix_total) as revenus'))
            ->with('vehicule:id,marque,modele,immatriculation,categorie')
            ->groupBy('vehicule_id')
            ->orderByDesc('nb_locations')
            ->limit(10)
            ->get();

        $parcTotal = Vehicule::count();
        $parcLoues = Vehicule::where('statut', 'loue')->count();

        $paiementsParJour = Paiement::where('statut', 'valide')
            ->whereBetween('date_paiement', [$debut, $fin])
            ->select(
                DB::raw("TO_CHAR(date_paiement, 'DD') as jour"),
                DB::raw('SUM(montant) as total')
            )
            ->groupBy('jour')
            ->orderBy('jour')
            ->get();

        $data = [
            'mois'             => $mois,
            'annee'            => $annee,
            'label_mois'       => $debut->locale('fr')->isoFormat('MMMM YYYY'),
            'ca_total'         => $ca,
            'reservations'     => $reservations,
            'top_vehicules'    => $topVehicules,
            'parc_total'       => $parcTotal,
            'parc_loues'       => $parcLoues,
            'taux_occupation'  => $parcTotal > 0 ? round(($parcLoues / $parcTotal) * 100, 1) : 0,
            'paiements_par_jour' => $paiementsParJour,
            'generated_at'     => now()->format('d/m/Y H:i'),
        ];

        $pdf = Pdf::loadView('pdf.rapport-mensuel', $data)
            ->setPaper('a4', 'portrait');

        $filename = 'rapport-' . $annee . '-' . str_pad($mois, 2, '0', STR_PAD_LEFT) . '.pdf';

        return $pdf->download($filename);
    }
}
