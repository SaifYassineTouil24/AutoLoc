<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Client;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Tymon\JWTAuth\Facades\JWTAuth;

class AuthController extends Controller
{
    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'      => 'required|string|max:100',
            'prenom'    => 'nullable|string|max:100',
            'email'     => 'required|email|unique:users',
            'password'  => 'required|string|min:8|confirmed',
            'telephone' => 'nullable|string|max:20',
        ]);

        $user = User::create([
            ...$validated,
            'role'   => 'client',
            'statut' => 'actif',
        ]);

        Client::create(['user_id' => $user->id]);

        $token = JWTAuth::fromUser($user);

        return response()->json([
            'user'         => $user,
            'access_token' => $token,
            'token_type'   => 'Bearer',
        ], 201);
    }

    public function login(Request $request): JsonResponse
    {
        $credentials = $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string',
        ]);

        if (!$token = JWTAuth::attempt($credentials)) {
            throw ValidationException::withMessages([
                'email' => ['Identifiants incorrects.'],
            ]);
        }

        /** @var User $user */
        $user = auth()->user();

        if ($user->statut !== 'actif') {
            JWTAuth::invalidate($token);
            return response()->json(['message' => 'Compte désactivé ou suspendu.'], 403);
        }

        $user->update(['last_login_at' => now()]);

        AuditLog::create([
            'user_id'    => $user->id,
            'action'     => 'login',
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'user'         => $user->load('client'),
            'access_token' => $token,
            'token_type'   => 'Bearer',
            'expires_in'   => config('jwt.ttl') * 60,
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        AuditLog::create([
            'user_id'    => auth()->id(),
            'action'     => 'logout',
            'ip_address' => $request->ip(),
        ]);

        JWTAuth::invalidate(JWTAuth::getToken());

        return response()->json(['message' => 'Déconnexion réussie.']);
    }

    public function refresh(): JsonResponse
    {
        $token = JWTAuth::refresh(JWTAuth::getToken());

        return response()->json([
            'access_token' => $token,
            'token_type'   => 'Bearer',
            'expires_in'   => config('jwt.ttl') * 60,
        ]);
    }

    public function me(): JsonResponse
    {
        return response()->json(['user' => auth()->user()->load('client')]);
    }

    public function updateProfile(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = auth()->user();

        $validated = $request->validate([
            'name'      => 'required|string|max:100',
            'prenom'    => 'nullable|string|max:100',
            'email'     => 'required|email|unique:users,email,' . $user->id,
            'telephone' => 'nullable|string|max:20',
        ]);

        $user->update($validated);

        // Also update client fields if provided
        if ($user->isClient() && $user->client) {
            $clientData = $request->validate([
                'adresse'    => 'nullable|string|max:255',
                'ville'      => 'nullable|string|max:100',
                'code_postal'=> 'nullable|string|max:10',
            ]);
            $user->client->update(array_filter($clientData, fn ($v) => $v !== null));
        }

        return response()->json(['user' => $user->fresh()->load('client'), 'message' => 'Profil mis à jour.']);
    }

    public function updatePassword(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'current_password' => 'required|string',
            'password'         => 'required|string|min:8|confirmed',
        ]);

        /** @var User $user */
        $user = auth()->user();

        if (!Hash::check($validated['current_password'], $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['Mot de passe actuel incorrect.'],
            ]);
        }

        $user->update(['password' => $validated['password']]);

        return response()->json(['message' => 'Mot de passe mis à jour.']);
    }
}
