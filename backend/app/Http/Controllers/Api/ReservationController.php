<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\ReservationConfirmee;
use App\Models\Reservation;
use App\Models\Vehicule;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;

class ReservationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Reservation::with(['client.user', 'vehicule', 'employe']);

        if ($request->filled('statut')) {
            $query->where('statut', $request->statut);
        }
        if ($request->filled('client_id')) {
            $query->where('client_id', $request->client_id);
        }
        if ($request->filled('vehicule_id')) {
            $query->where('vehicule_id', $request->vehicule_id);
        }
        if ($request->filled('date_debut')) {
            $query->where('date_debut', '>=', $request->date_debut);
        }
        if ($request->filled('date_fin')) {
            $query->where('date_fin', '<=', $request->date_fin);
        }

        // Client ne voit que ses propres réservations
        if (auth()->user()->isClient()) {
            $query->where('client_id', auth()->user()->client->id);
        }

        return response()->json($query->orderByDesc('created_at')->paginate(20));
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'client_id'           => 'required|exists:clients,id',
            'vehicule_id'         => 'required|exists:vehicules,id',
            'date_debut'          => 'required|date|after:now',
            'date_fin'            => 'required|date|after:date_debut',
            'lieu_prise_en_charge' => 'nullable|string',
            'lieu_retour'         => 'nullable|string',
            'mode_paiement'       => 'nullable|in:carte,especes,virement,cheque',
            'remise'              => 'nullable|numeric|min:0',
            'notes'               => 'nullable|string',
        ]);

        $vehicule = Vehicule::findOrFail($validated['vehicule_id']);

        if (!$vehicule->estDisponible(
            \Carbon\Carbon::parse($validated['date_debut']),
            \Carbon\Carbon::parse($validated['date_fin'])
        )) {
            return response()->json(['message' => 'Le véhicule n\'est pas disponible sur cette période.'], 422);
        }

        $debut      = \Carbon\Carbon::parse($validated['date_debut']);
        $fin        = \Carbon\Carbon::parse($validated['date_fin']);
        $jours      = max(1, (int) $debut->diffInDays($fin));
        $prixBase   = $vehicule->tarif_journalier * $jours;
        $prixTotal  = $prixBase - ($validated['remise'] ?? 0);

        $reservation = Reservation::create([
            ...$validated,
            'employe_id'             => auth()->user()->isClient() ? null : auth()->id(),
            'prix_base'              => $prixBase,
            'prix_total'             => max(0, $prixTotal),
            'coefficient_tarification' => 1.0,
            'statut'                 => 'en_attente',
            'source'                 => auth()->user()->isClient() ? 'web' : 'agence',
        ]);

        return response()->json($reservation->load(['client.user', 'vehicule']), 201);
    }

    public function show(Reservation $reservation): JsonResponse
    {
        $this->authorizeReservation($reservation);

        return response()->json($reservation->load(['client.user', 'vehicule', 'employe', 'contrat']));
    }

    public function update(Request $request, Reservation $reservation): JsonResponse
    {
        if (in_array($reservation->statut, ['terminee', 'annulee'])) {
            return response()->json(['message' => 'Cette réservation ne peut plus être modifiée.'], 422);
        }

        $validated = $request->validate([
            'date_debut'   => 'sometimes|date',
            'date_fin'     => 'sometimes|date|after:date_debut',
            'vehicule_id'  => 'sometimes|exists:vehicules,id',
            'statut'       => 'sometimes|in:en_attente,confirmee,en_cours,terminee,annulee',
            'remise'       => 'nullable|numeric|min:0',
            'notes'        => 'nullable|string',
        ]);

        if (isset($validated['vehicule_id']) || isset($validated['date_debut']) || isset($validated['date_fin'])) {
            $vehiculeId = $validated['vehicule_id'] ?? $reservation->vehicule_id;
            $debut      = \Carbon\Carbon::parse($validated['date_debut'] ?? $reservation->date_debut);
            $fin        = \Carbon\Carbon::parse($validated['date_fin'] ?? $reservation->date_fin);

            $vehicule = Vehicule::findOrFail($vehiculeId);
            $conflit  = Reservation::where('vehicule_id', $vehiculeId)
                ->where('id', '!=', $reservation->id)
                ->whereIn('statut', ['confirmee', 'en_cours'])
                ->where('date_debut', '<', $fin)
                ->where('date_fin', '>', $debut)
                ->exists();

            if ($conflit) {
                return response()->json(['message' => 'Conflit de disponibilité détecté.'], 422);
            }

            if (isset($validated['vehicule_id'])) {
                $jours     = max(1, (int) $debut->diffInDays($fin));
                $validated['prix_base']  = $vehicule->tarif_journalier * $jours;
                $validated['prix_total'] = $validated['prix_base'] - ($validated['remise'] ?? $reservation->remise);
            }
        }

        $reservation->update($validated);

        return response()->json($reservation->load(['client.user', 'vehicule']));
    }

    public function annuler(Request $request, Reservation $reservation): JsonResponse
    {
        if (in_array($reservation->statut, ['terminee', 'annulee'])) {
            return response()->json(['message' => 'Cette réservation est déjà clôturée.'], 422);
        }

        $fraisAnnulation = 0;
        $now = now();
        $heuresAvantDebut = $now->diffInHours($reservation->date_debut, false);

        if ($heuresAvantDebut < 24 && $heuresAvantDebut > 0) {
            // Annulation tardive : 1 jour de tarif
            $fraisAnnulation = $reservation->vehicule->tarif_journalier;
        }

        $reservation->update(['statut' => 'annulee']);

        return response()->json([
            'message'          => 'Réservation annulée.',
            'frais_annulation' => $fraisAnnulation,
        ]);
    }

    public function confirmer(Reservation $reservation): JsonResponse
    {
        if ($reservation->statut !== 'en_attente') {
            return response()->json(['message' => 'Seules les réservations en attente peuvent être confirmées.'], 422);
        }

        $reservation->update(['statut' => 'confirmee', 'employe_id' => auth()->id()]);
        $reservation->load(['client.user', 'vehicule']);

        try {
            Mail::to($reservation->client->user->email)
                ->queue(new ReservationConfirmee($reservation));
        } catch (\Throwable) {}

        return response()->json($reservation);
    }

    private function authorizeReservation(Reservation $reservation): void
    {
        if (auth()->user()->isClient()) {
            abort_if($reservation->client_id !== auth()->user()->client?->id, 403);
        }
    }
}
