<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\ContratSigne;
use App\Models\Contrat;
use App\Models\Reservation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class ContratController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Contrat::with(['reservation.client.user', 'reservation.vehicule', 'employe']);

        if ($request->filled('statut')) {
            $query->where('statut', $request->statut);
        }
        if (auth()->user()->isClient()) {
            $query->whereHas('reservation', fn ($q) =>
                $q->where('client_id', auth()->user()->client?->id)
            );
        }

        return response()->json($query->orderByDesc('created_at')->paginate(20));
    }

    public function generer(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'reservation_id'          => 'required|exists:reservations,id',
            'etat_depart_vehicule'    => 'required|in:excellent,bon,acceptable,mauvais',
            'kilometrage_depart'      => 'required|integer|min:0',
            'niveau_carburant_depart' => 'required|integer|min:0|max:100',
            'photos_depart'           => 'nullable|array',
            'accessoires'             => 'nullable|array',
            'conditions_particulieres' => 'nullable|string',
            'franchise'               => 'nullable|numeric|min:0',
            'assurance_type'          => 'nullable|in:basique,tous_risques,premium',
        ]);

        $reservation = Reservation::findOrFail($validated['reservation_id']);

        if ($reservation->statut !== 'confirmee') {
            return response()->json(['message' => 'La réservation doit être confirmée avant de générer un contrat.'], 422);
        }

        if ($reservation->contrat()->exists()) {
            return response()->json(['message' => 'Un contrat existe déjà pour cette réservation.'], 422);
        }

        $contrat = Contrat::create([
            ...$validated,
            'employe_id'  => auth()->id(),
            'statut'      => 'brouillon',
        ]);

        return response()->json($contrat->load(['reservation.client.user', 'reservation.vehicule']), 201);
    }

    public function show(Contrat $contrat): JsonResponse
    {
        $contrat->load(['reservation.client.user', 'reservation.vehicule', 'employe', 'paiements', 'retour']);

        return response()->json($contrat);
    }

    public function signer(Request $request, Contrat $contrat): JsonResponse
    {
        if ($contrat->statut !== 'brouillon') {
            return response()->json(['message' => 'Ce contrat ne peut plus être signé.'], 422);
        }

        $validated = $request->validate([
            'signature_client'  => 'required|string',
            'signature_employe' => 'required|string',
        ]);

        $contrat->update([
            ...$validated,
            'date_signature' => now(),
            'statut'         => 'signe',
        ]);

        $contrat->reservation->update(['statut' => 'en_cours']);
        $contrat->reservation->vehicule->update(['statut' => 'loue']);

        $contrat->load(['reservation.client.user', 'reservation.vehicule']);
        try {
            Mail::to($contrat->reservation->client->user->email)
                ->queue(new ContratSigne($contrat));
        } catch (\Throwable) {}

        return response()->json($contrat);
    }

    public function update(Request $request, Contrat $contrat): JsonResponse
    {
        if (in_array($contrat->statut, ['termine', 'resilie'])) {
            return response()->json(['message' => 'Ce contrat est clôturé.'], 422);
        }

        $validated = $request->validate([
            'conditions_particulieres' => 'nullable|string',
            'franchise'                => 'nullable|numeric|min:0',
            'assurance_type'           => 'nullable|in:basique,tous_risques,premium',
        ]);

        $contrat->update($validated);

        return response()->json($contrat);
    }
}
