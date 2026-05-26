<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = User::query();

        if ($request->filled('role')) {
            $query->where('role', $request->role);
        }
        if ($request->filled('statut')) {
            $query->where('statut', $request->statut);
        }

        return response()->json($query->orderBy('name')->paginate(20));
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'      => 'required|string|max:100',
            'prenom'    => 'nullable|string|max:100',
            'email'     => 'required|email|unique:users',
            'password'  => 'required|string|min:8',
            'role'      => 'required|in:administrateur,employe,client',
            'telephone' => 'nullable|string|max:20',
        ]);

        $user = User::create([...$validated, 'statut' => 'actif']);

        return response()->json($user, 201);
    }

    public function show(User $user): JsonResponse
    {
        return response()->json($user->load('client'));
    }

    public function update(Request $request, User $user): JsonResponse
    {
        $validated = $request->validate([
            'name'      => 'sometimes|string|max:100',
            'prenom'    => 'nullable|string|max:100',
            'email'     => 'sometimes|email|unique:users,email,' . $user->id,
            'role'      => 'sometimes|in:administrateur,employe,client',
            'statut'    => 'sometimes|in:actif,inactif,suspendu',
            'telephone' => 'nullable|string|max:20',
        ]);

        $user->update($validated);

        return response()->json($user);
    }

    public function destroy(User $user): JsonResponse
    {
        if ($user->id === auth()->id()) {
            return response()->json(['message' => 'Impossible de supprimer votre propre compte.'], 422);
        }

        $user->update(['statut' => 'inactif']);

        return response()->json(['message' => 'Utilisateur désactivé.']);
    }
}
