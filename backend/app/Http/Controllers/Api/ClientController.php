<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Client;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ClientController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Client::with('user');

        if ($request->filled('segment')) {
            $query->where('segment', $request->segment);
        }
        if ($request->filled('search')) {
            $search = $request->search;
            $query->whereHas('user', function ($q) use ($search) {
                $q->where('name', 'ilike', "%$search%")
                  ->orWhere('prenom', 'ilike', "%$search%")
                  ->orWhere('email', 'ilike', "%$search%");
            })->orWhere('numero_cni', 'ilike', "%$search%")
              ->orWhere('numero_permis', 'ilike', "%$search%");
        }

        return response()->json($query->orderByDesc('score_fiabilite')->paginate(20));
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'          => 'required|string|max:100',
            'prenom'        => 'nullable|string|max:100',
            'email'         => 'required|email|unique:users',
            'password'      => 'required|string|min:8',
            'telephone'     => 'nullable|string|max:20',
            'numero_cni'    => 'nullable|string|max:50|unique:clients',
            'numero_permis' => 'nullable|string|max:50|unique:clients',
            'date_naissance' => 'nullable|date',
            'adresse'       => 'nullable|string',
            'ville'         => 'nullable|string|max:100',
        ]);

        return DB::transaction(function () use ($validated) {
            $user = User::create([
                'name'      => $validated['name'],
                'prenom'    => $validated['prenom'] ?? null,
                'email'     => $validated['email'],
                'password'  => $validated['password'],
                'telephone' => $validated['telephone'] ?? null,
                'role'      => 'client',
                'statut'    => 'actif',
            ]);

            $client = Client::create([
                'user_id'        => $user->id,
                'numero_cni'     => $validated['numero_cni'] ?? null,
                'numero_permis'  => $validated['numero_permis'] ?? null,
                'date_naissance' => $validated['date_naissance'] ?? null,
                'adresse'        => $validated['adresse'] ?? null,
                'ville'          => $validated['ville'] ?? null,
            ]);

            return response()->json($client->load('user'), 201);
        });
    }

    public function show(Client $client): JsonResponse
    {
        $client->load(['user', 'reservations.vehicule', 'reservations.contrat']);

        return response()->json($client);
    }

    public function update(Request $request, Client $client): JsonResponse
    {
        $validated = $request->validate([
            'name'          => 'sometimes|string|max:100',
            'prenom'        => 'nullable|string|max:100',
            'telephone'     => 'nullable|string|max:20',
            'numero_cni'    => 'nullable|string|max:50|unique:clients,numero_cni,' . $client->id,
            'numero_permis' => 'nullable|string|max:50|unique:clients,numero_permis,' . $client->id,
            'date_naissance' => 'nullable|date',
            'adresse'       => 'nullable|string',
            'ville'         => 'nullable|string|max:100',
            'code_postal'   => 'nullable|string|max:10',
            'notes'         => 'nullable|string',
        ]);

        $client->user->update(array_intersect_key($validated, array_flip(['name', 'prenom', 'telephone'])));
        $client->update(array_diff_key($validated, array_flip(['name', 'prenom'])));

        return response()->json($client->load('user'));
    }

    public function score(Client $client): JsonResponse
    {
        $client->recalculerScore();

        return response()->json([
            'score'   => $client->score_fiabilite,
            'segment' => $client->segment,
        ]);
    }

    public function historique(Client $client): JsonResponse
    {
        $historique = $client->reservations()
            ->with(['vehicule', 'contrat.paiements', 'contrat.retour'])
            ->orderByDesc('date_debut')
            ->get();

        return response()->json($historique);
    }
}
