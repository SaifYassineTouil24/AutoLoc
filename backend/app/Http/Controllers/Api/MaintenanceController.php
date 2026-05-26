<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Maintenance;
use App\Models\Vehicule;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MaintenanceController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Maintenance::with('vehicule');

        if ($request->filled('vehicule_id')) {
            $query->where('vehicule_id', $request->vehicule_id);
        }
        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }
        if ($request->filled('statut')) {
            $query->where('statut', $request->statut);
        }

        return response()->json($query->orderByDesc('date_prevue')->paginate(20));
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'vehicule_id'              => 'required|exists:vehicules,id',
            'type'                     => 'required|in:vidange,visite_technique,vignette,pneus,freins,revision,autre',
            'sous_type'                => 'nullable|string|max:100',
            'description'              => 'nullable|string',
            'date_prevue'              => 'nullable|date',
            'kilometrage_reference'    => 'nullable|integer|min:0',
            'prestataire'              => 'nullable|string',
            'cout'                     => 'nullable|numeric|min:0',
            'duree_immobilisation_jours' => 'nullable|integer|min:0',
            'notes'                    => 'nullable|string',
        ]);

        $maintenance = Maintenance::create([...$validated, 'statut' => 'planifiee']);

        // Passer le véhicule en maintenance si la date prévue est aujourd'hui ou passée
        if ($maintenance->date_prevue && $maintenance->date_prevue->lte(now())) {
            $maintenance->vehicule->update(['statut' => 'en_maintenance']);
        }

        return response()->json($maintenance->load('vehicule'), 201);
    }

    public function show(Maintenance $maintenance): JsonResponse
    {
        return response()->json($maintenance->load('vehicule'));
    }

    public function update(Request $request, Maintenance $maintenance): JsonResponse
    {
        $validated = $request->validate([
            'date_prevue'           => 'nullable|date',
            'date_effective'        => 'nullable|date',
            'kilometrage_effectif'  => 'nullable|integer|min:0',
            'prestataire'           => 'nullable|string',
            'cout'                  => 'nullable|numeric|min:0',
            'statut'                => 'sometimes|in:planifiee,en_cours,terminee,annulee',
            'justificatif'          => 'nullable|string',
            'notes'                 => 'nullable|string',
        ]);

        $maintenance->update($validated);

        if ($validated['statut'] ?? null === 'terminee') {
            $this->mettreAJourVehiculeApresMaintenance($maintenance);
        }

        return response()->json($maintenance->load('vehicule'));
    }

    public function terminer(Request $request, Maintenance $maintenance): JsonResponse
    {
        $validated = $request->validate([
            'date_effective'       => 'required|date',
            'kilometrage_effectif' => 'nullable|integer|min:0',
            'cout'                 => 'nullable|numeric|min:0',
            'prestataire'          => 'nullable|string',
            'justificatif'         => 'nullable|string',
            'notes'                => 'nullable|string',
        ]);

        $maintenance->update([
            ...$validated,
            'statut' => 'terminee',
        ]);

        $this->mettreAJourVehiculeApresMaintenance($maintenance->fresh());

        return response()->json($maintenance->load('vehicule'));
    }

    private function mettreAJourVehiculeApresMaintenance(Maintenance $maintenance): void
    {
        $vehicule = $maintenance->vehicule;
        $updates  = [];

        match ($maintenance->type) {
            'vidange' => $updates = [
                'derniere_vidange_date' => $maintenance->date_effective,
                'derniere_vidange_km'   => $maintenance->kilometrage_effectif,
                'prochaine_vidange_km'  => ($maintenance->kilometrage_effectif ?? $vehicule->kilometrage) + 10000,
                'prochaine_vidange_date' => $maintenance->date_effective?->addMonths(6),
            ],
            'visite_technique' => $updates = [
                'derniere_visite_technique_date'  => $maintenance->date_effective,
                'prochaine_visite_technique_date' => $maintenance->date_effective?->addYear(),
            ],
            'vignette' => $updates = [
                'vignette_payee'         => true,
                'vignette_annee'         => $maintenance->date_effective?->year ?? now()->year,
                'vignette_date_paiement' => $maintenance->date_effective,
            ],
            default => null,
        };

        if (!empty($updates)) {
            $vehicule->update($updates);
        }

        // Remettre disponible si aucune autre maintenance active
        $autreMaintenance = Maintenance::where('vehicule_id', $vehicule->id)
            ->whereIn('statut', ['planifiee', 'en_cours'])
            ->where('id', '!=', $maintenance->id)
            ->exists();

        if (!$autreMaintenance && $vehicule->statut === 'en_maintenance') {
            $vehicule->update(['statut' => 'disponible']);
        }
    }
}
