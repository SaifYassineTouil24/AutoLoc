<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Vehicule;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class VehiculeController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Vehicule::query();

        if ($request->filled('statut')) {
            $query->where('statut', $request->statut);
        }
        if ($request->filled('categorie')) {
            $query->where('categorie', $request->categorie);
        }
        if ($request->filled('marque')) {
            $query->where('marque', 'ilike', '%' . $request->marque . '%');
        }
        if ($request->filled('prix_max')) {
            $query->where('tarif_journalier', '<=', $request->prix_max);
        }
        if ($request->filled('prix_min')) {
            $query->where('tarif_journalier', '>=', $request->prix_min);
        }

        // Filtre disponibilité sur une période
        if ($request->filled('date_debut') && $request->filled('date_fin')) {
            $debut = $request->date_debut;
            $fin   = $request->date_fin;
            $query->where('statut', 'disponible')
                ->whereDoesntHave('reservations', function ($q) use ($debut, $fin) {
                    $q->whereIn('statut', ['confirmee', 'en_cours'])
                      ->where('date_debut', '<', $fin)
                      ->where('date_fin', '>', $debut);
                });
        }

        $vehicules = $query->orderBy('marque')->paginate(20);

        return response()->json($vehicules);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'immatriculation'    => 'required|string|max:20|unique:vehicules',
            'marque'             => 'required|string|max:50',
            'modele'             => 'required|string|max:100',
            'annee'              => 'required|integer|min:1990|max:' . (date('Y') + 1),
            'couleur'            => 'nullable|string|max:50',
            'categorie'          => 'required|in:economique,compacte,berline,suv,utilitaire,luxe,cabriolet',
            'kilometrage'        => 'required|integer|min:0',
            'tarif_journalier'   => 'required|numeric|min:0',
            'depot_garantie'     => 'nullable|numeric|min:0',
            'nombre_places'      => 'nullable|integer|min:1|max:9',
            'boite_vitesse'      => 'nullable|in:manuelle,automatique',
            'description'        => 'nullable|string',
            'date_assurance'     => 'nullable|date',
            'prochaine_visite_technique_date' => 'nullable|date',
            'vignette_annee'     => 'nullable|integer',
            'vignette_payee'     => 'nullable|boolean',
            'derniere_vidange_km' => 'nullable|integer',
            'prochaine_vidange_km' => 'nullable|integer',
        ]);

        $vehicule = Vehicule::create($validated);

        return response()->json($vehicule, 201);
    }

    public function show(Vehicule $vehicule): JsonResponse
    {
        $vehicule->load('maintenances');
        $vehicule->obligations = $vehicule->statutObligations();

        return response()->json($vehicule);
    }

    public function update(Request $request, Vehicule $vehicule): JsonResponse
    {
        $validated = $request->validate([
            'marque'                          => 'sometimes|string|max:50',
            'modele'                          => 'sometimes|string|max:100',
            'annee'                           => 'sometimes|integer|min:1990',
            'couleur'                         => 'nullable|string|max:50',
            'categorie'                       => 'sometimes|in:economique,compacte,berline,suv,utilitaire,luxe,cabriolet',
            'kilometrage'                     => 'sometimes|integer|min:0',
            'statut'                          => 'sometimes|in:disponible,loue,en_maintenance,hors_service',
            'tarif_journalier'                => 'sometimes|numeric|min:0',
            'depot_garantie'                  => 'nullable|numeric|min:0',
            'description'                     => 'nullable|string',
            'date_assurance'                  => 'nullable|date',
            'prochaine_visite_technique_date' => 'nullable|date',
            'derniere_visite_technique_date'  => 'nullable|date',
            'vignette_annee'                  => 'nullable|integer',
            'vignette_payee'                  => 'nullable|boolean',
            'vignette_date_paiement'          => 'nullable|date',
            'derniere_vidange_date'           => 'nullable|date',
            'derniere_vidange_km'             => 'nullable|integer',
            'prochaine_vidange_km'            => 'nullable|integer',
            'prochaine_vidange_date'          => 'nullable|date',
        ]);

        $vehicule->update($validated);

        return response()->json($vehicule);
    }

    public function destroy(Vehicule $vehicule): JsonResponse
    {
        if ($vehicule->reservations()->whereIn('statut', ['confirmee', 'en_cours'])->exists()) {
            return response()->json(['message' => 'Impossible de supprimer un véhicule avec des réservations actives.'], 422);
        }

        $vehicule->delete();

        return response()->json(['message' => 'Véhicule supprimé.']);
    }

    public function uploadPhoto(Request $request, Vehicule $vehicule): JsonResponse
    {
        $request->validate([
            'photo'      => 'required|image|max:5120',
            'principale' => 'nullable|boolean',
        ]);

        $path = $request->file('photo')->store('vehicules/' . $vehicule->id, 'public');

        if ($request->boolean('principale', false)) {
            $vehicule->update(['photo_principale' => $path]);
        } else {
            $photos   = $vehicule->photos ?? [];
            $photos[] = $path;
            $vehicule->update(['photos' => $photos]);
        }

        return response()->json(['path' => $path, 'url' => Storage::url($path)]);
    }

    public function obligations(Vehicule $vehicule): JsonResponse
    {
        return response()->json($vehicule->statutObligations());
    }

    public function catalogue(Request $request): JsonResponse
    {
        $query = Vehicule::where('statut', 'disponible');

        if ($request->filled('categorie')) {
            $query->where('categorie', $request->categorie);
        }
        if ($request->filled('prix_max')) {
            $query->where('tarif_journalier', '<=', $request->prix_max);
        }
        if ($request->filled('prix_min')) {
            $query->where('tarif_journalier', '>=', $request->prix_min);
        }
        if ($request->filled('marque')) {
            $query->where('marque', 'ilike', '%' . $request->marque . '%');
        }

        if ($request->filled('date_debut') && $request->filled('date_fin')) {
            $debut = $request->date_debut;
            $fin   = $request->date_fin;
            $query->whereDoesntHave('reservations', function ($q) use ($debut, $fin) {
                $q->whereIn('statut', ['confirmee', 'en_cours'])
                  ->where('date_debut', '<', $fin)
                  ->where('date_fin', '>', $debut);
            });
        }

        $vehicules = $query
            ->select('id', 'marque', 'modele', 'annee', 'categorie', 'couleur', 'energie',
                'boite_vitesse', 'nombre_places', 'tarif_journalier', 'depot_garantie',
                'description', 'photo_principale', 'photos', 'kilometrage')
            ->orderBy('categorie')
            ->orderBy('tarif_journalier')
            ->get();

        return response()->json($vehicules);
    }

    public function alertes(): JsonResponse
    {
        $vehicules = Vehicule::whereNotIn('statut', ['hors_service'])->get();

        $alertes = $vehicules->filter(function (Vehicule $v) {
            $obligations = $v->statutObligations();
            return collect($obligations)->contains(fn ($s) => in_array($s, ['a_prevoir', 'en_retard']));
        })->map(function (Vehicule $v) {
            return [
                'vehicule'    => $v->only(['id', 'immatriculation', 'marque', 'modele']),
                'obligations' => $v->statutObligations(),
            ];
        })->values();

        return response()->json($alertes);
    }
}
