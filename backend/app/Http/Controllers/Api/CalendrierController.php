<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Reservation;
use App\Models\Vehicule;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CalendrierController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $debut = $request->get('debut', now()->startOfMonth()->toDateString());
        $fin   = $request->get('fin',   now()->endOfMonth()->toDateString());

        $reservations = Reservation::with(['vehicule:id,marque,modele,immatriculation,categorie', 'client.user:id,prenom,name'])
            ->where(function ($q) use ($debut, $fin) {
                $q->whereBetween('date_debut', [$debut . ' 00:00:00', $fin . ' 23:59:59'])
                  ->orWhereBetween('date_fin',  [$debut . ' 00:00:00', $fin . ' 23:59:59'])
                  ->orWhere(function ($q2) use ($debut, $fin) {
                      $q2->where('date_debut', '<=', $debut . ' 00:00:00')
                         ->where('date_fin',   '>=', $fin   . ' 23:59:59');
                  });
            })
            ->whereNotIn('statut', ['annulee'])
            ->get()
            ->map(fn ($r) => [
                'id'         => $r->id,
                'numero'     => $r->numero_reservation,
                'vehicule_id'=> $r->vehicule_id,
                'vehicule'   => $r->vehicule,
                'client'     => $r->client?->user
                    ? ['nom' => $r->client->user->prenom . ' ' . $r->client->user->name]
                    : null,
                'debut'      => $r->date_debut->toDateString(),
                'fin'        => $r->date_fin->toDateString(),
                'statut'     => $r->statut,
                'prix_total' => $r->prix_total,
            ]);

        $vehicules = Vehicule::select('id', 'marque', 'modele', 'immatriculation', 'categorie', 'statut', 'tarif_journalier')
            ->orderBy('categorie')
            ->orderBy('marque')
            ->get();

        return response()->json([
            'reservations' => $reservations,
            'vehicules'    => $vehicules,
            'debut'        => $debut,
            'fin'          => $fin,
        ]);
    }
}
