<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AppNotification;
use App\Models\Contrat;
use App\Models\Paiement;
use App\Models\Retour;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class RetourController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Retour::with(['contrat.reservation.client.user', 'contrat.reservation.vehicule', 'employe']);

        return response()->json($query->orderByDesc('date_retour_effective')->paginate(20));
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'contrat_id'              => 'required|exists:contrats,id',
            'date_retour_effective'   => 'required|date',
            'kilometrage_retour'      => 'required|integer|min:0',
            'niveau_carburant_retour' => 'required|integer|min:0|max:100',
            'etat_general'            => 'required|in:excellent,bon,acceptable,mauvais',
            'dommages_constates'      => 'required|boolean',
            'description_dommages'    => 'nullable|string',
            'photos_retour'           => 'nullable|array',
            'accessoires_manquants'   => 'nullable|array',
            'penalite_dommages'       => 'nullable|numeric|min:0',
            'penalite_accessoires'    => 'nullable|numeric|min:0',
            'notes'                   => 'nullable|string',
        ]);

        $contrat = Contrat::findOrFail($validated['contrat_id']);

        if ($contrat->retour()->exists()) {
            return response()->json(['message' => 'Un retour a déjà été enregistré pour ce contrat.'], 422);
        }

        return DB::transaction(function () use ($validated, $contrat) {
            $retour = Retour::create([
                ...$validated,
                'employe_id'         => auth()->id(),
                'date_retour_prevue' => $contrat->reservation->date_fin,
            ]);

            $retour->contrat_id                = $contrat->id;
            $retour->penalite_dommages         = $validated['penalite_dommages'] ?? 0;
            $retour->penalite_accessoires      = $validated['penalite_accessoires'] ?? 0;
            $retour->calculerPenalites();
            $retour->save();

            // Mise à jour du kilométrage du véhicule
            $vehicule = $contrat->reservation->vehicule;
            $vehicule->update([
                'kilometrage' => $validated['kilometrage_retour'],
                'statut'      => 'disponible',
            ]);

            $contrat->update(['statut' => 'termine']);
            $contrat->reservation->update(['statut' => 'terminee']);

            // Recalcul du score client
            $contrat->reservation->client->recalculerScore();

            // Auto-créer un paiement pénalité si retard ou dommages
            if ($retour->penalite_totale > 0) {
                Paiement::create([
                    'contrat_id'    => $contrat->id,
                    'employe_id'    => auth()->id(),
                    'montant'       => $retour->penalite_totale,
                    'mode'          => 'especes',
                    'type'          => 'penalite',
                    'statut'        => 'en_attente',
                    'date_paiement' => now(),
                    'notes'         => 'Pénalité auto : retard ' . $retour->penalite_retard . ' MAD, carburant ' . $retour->penalite_carburant . ' MAD, dommages ' . $retour->penalite_dommages . ' MAD',
                ]);

                // Notify client
                $userId = $contrat->reservation->client->user_id;
                if ($userId) {
                    AppNotification::create([
                        'user_id'  => $userId,
                        'type'     => 'paiement_retard',
                        'priorite' => 'haute',
                        'titre'    => 'Pénalité de retour appliquée',
                        'message'  => 'Une pénalité de ' . number_format($retour->penalite_totale, 2) . ' MAD a été générée suite à votre retour.',
                        'lien'     => '/contrats/' . $contrat->id,
                    ]);
                }
            }

            return response()->json($retour->load(['contrat.reservation.vehicule', 'employe']), 201);
        });
    }

    public function show(Retour $retour): JsonResponse
    {
        return response()->json($retour->load([
            'contrat.reservation.client.user',
            'contrat.reservation.vehicule',
            'employe',
        ]));
    }
}
