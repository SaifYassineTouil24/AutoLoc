<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AppNotification;
use App\Models\Reclamation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReclamationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Reclamation::with(['client.user', 'reservation.vehicule', 'agent']);

        if (auth()->user()->isClient()) {
            $query->where('client_id', auth()->user()->client?->id);
        }

        if ($request->filled('statut'))   $query->where('statut',   $request->statut);
        if ($request->filled('type'))     $query->where('type',     $request->type);
        if ($request->filled('priorite')) $query->where('priorite', $request->priorite);

        return response()->json($query->orderByDesc('created_at')->paginate(20));
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'type'           => 'required|in:facturation,vehicule,service,retard,autre',
            'priorite'       => 'nullable|in:haute,normale,basse',
            'titre'          => 'required|string|max:200',
            'description'    => 'required|string',
            'reservation_id' => 'nullable|exists:reservations,id',
        ]);

        $clientId = auth()->user()->isClient()
            ? auth()->user()->client?->id
            : $request->validate(['client_id' => 'required|exists:clients,id'])['client_id'];

        $reclamation = Reclamation::create([
            ...$validated,
            'client_id' => $clientId,
            'statut'    => 'ouverte',
        ]);

        // Notify all staff
        $staffIds = \App\Models\User::whereIn('role', ['administrateur', 'employe'])->pluck('id');
        foreach ($staffIds as $uid) {
            AppNotification::create([
                'user_id'  => $uid,
                'type'     => 'info',
                'priorite' => $validated['priorite'] ?? 'normale',
                'titre'    => 'Nouvelle réclamation : ' . $validated['titre'],
                'message'  => $validated['description'],
                'lien'     => '/reclamations/' . $reclamation->id,
            ]);
        }

        return response()->json($reclamation->load('client.user'), 201);
    }

    public function show(Reclamation $reclamation): JsonResponse
    {
        $this->authorizeAccess($reclamation);
        return response()->json($reclamation->load(['client.user', 'reservation.vehicule', 'agent']));
    }

    public function update(Request $request, Reclamation $reclamation): JsonResponse
    {
        abort_if(auth()->user()->isClient(), 403);

        $validated = $request->validate([
            'statut'   => 'sometimes|in:ouverte,en_traitement,resolue,fermee',
            'reponse'  => 'nullable|string',
            'priorite' => 'sometimes|in:haute,normale,basse',
            'agent_id' => 'nullable|exists:users,id',
        ]);

        if (isset($validated['statut']) && in_array($validated['statut'], ['resolue', 'fermee'])) {
            $validated['closed_at'] = now();
        }

        if (!isset($validated['agent_id']) && $reclamation->statut === 'ouverte') {
            $validated['agent_id'] = auth()->id();
            $validated['statut']   = $validated['statut'] ?? 'en_traitement';
        }

        $reclamation->update($validated);

        // Notify client of response
        if (!empty($validated['reponse'])) {
            AppNotification::create([
                'user_id'  => $reclamation->client->user_id,
                'type'     => 'info',
                'priorite' => 'normale',
                'titre'    => 'Réponse à votre réclamation',
                'message'  => $validated['reponse'],
                'lien'     => '/reclamations',
            ]);
        }

        return response()->json($reclamation->load(['client.user', 'agent']));
    }

    public function destroy(Reclamation $reclamation): JsonResponse
    {
        abort_if(!auth()->user()->isAdmin(), 403);
        $reclamation->delete();
        return response()->json(['ok' => true]);
    }

    private function authorizeAccess(Reclamation $reclamation): void
    {
        if (auth()->user()->isClient()) {
            abort_if($reclamation->client_id !== auth()->user()->client?->id, 403);
        }
    }
}
