<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\PaiementRecu;
use App\Models\Contrat;
use App\Models\Paiement;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class PaiementController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Paiement::with(['contrat.reservation.client.user', 'employe']);

        if ($request->filled('statut')) {
            $query->where('statut', $request->statut);
        }
        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }
        if ($request->filled('contrat_id')) {
            $query->where('contrat_id', $request->contrat_id);
        }

        if (auth()->user()->isClient()) {
            $query->whereHas('contrat.reservation', fn ($q) =>
                $q->where('client_id', auth()->user()->client?->id)
            );
        }

        return response()->json($query->orderByDesc('created_at')->paginate(20));
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'contrat_id'           => 'required|exists:contrats,id',
            'montant'              => 'required|numeric|min:0.01',
            'mode'                 => 'required|in:carte,especes,virement,cheque',
            'type'                 => 'required|in:acompte,solde,penalite,remboursement,depot',
            'reference_transaction' => 'nullable|string',
            'date_paiement'        => 'nullable|date',
            'notes'                => 'nullable|string',
        ]);

        $contrat = Contrat::findOrFail($validated['contrat_id']);

        $totalPaye = $contrat->montantPaye() + $validated['montant'];
        if ($totalPaye > $contrat->reservation->prix_total && $validated['type'] !== 'remboursement') {
            return response()->json([
                'message' => 'Le total des paiements dépasserait le montant du contrat.',
            ], 422);
        }

        $paiement = Paiement::create([
            ...$validated,
            'employe_id'     => auth()->id(),
            'statut'         => 'valide',
            'date_paiement'  => $validated['date_paiement'] ?? now(),
        ]);

        $paiement->load(['contrat.reservation.client.user', 'contrat.reservation.vehicule']);
        try {
            $email = $paiement->contrat->reservation->client->user->email;
            Mail::to($email)->queue(new PaiementRecu($paiement));
        } catch (\Throwable) {}

        return response()->json($paiement->load('contrat'), 201);
    }

    public function show(Paiement $paiement): JsonResponse
    {
        return response()->json($paiement->load(['contrat.reservation.client.user', 'employe']));
    }

    public function impayés(): JsonResponse
    {
        $contrats = Contrat::with(['reservation.client.user', 'reservation.vehicule', 'paiements'])
            ->whereIn('statut', ['signe', 'actif'])
            ->get()
            ->filter(fn (Contrat $c) => $c->soldeDu() > 0)
            ->map(fn (Contrat $c) => [
                'contrat'      => $c->only(['id', 'numero_contrat', 'statut']),
                'client'       => $c->reservation->client->user->only(['name', 'prenom', 'email']),
                'montant_du'   => $c->soldeDu(),
                'prix_total'   => $c->reservation->prix_total,
            ])
            ->values();

        return response()->json($contrats);
    }
}
