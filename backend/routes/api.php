<?php

use App\Http\Controllers\Api\AnalytiqueController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CalendrierController;
use App\Http\Controllers\Api\ClientController;
use App\Http\Controllers\Api\ContratController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\MaintenanceController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\PaiementController;
use App\Http\Controllers\Api\PdfController;
use App\Http\Controllers\Api\ReclamationController;
use App\Http\Controllers\Api\ReservationController;
use App\Http\Controllers\Api\RetourController;
use App\Http\Controllers\Api\SearchController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\VehiculeController;
use Illuminate\Support\Facades\Route;

// ──────────────────────────────────────────────
// Routes publiques (non authentifiées)
// ──────────────────────────────────────────────
Route::prefix('auth')->group(function () {
    Route::post('register', [AuthController::class, 'register']);
    Route::post('login',    [AuthController::class, 'login']);
});

// Catalogue public (lecture seule, véhicules disponibles)
Route::get('vehicules/disponibles', [VehiculeController::class, 'index']);
Route::get('catalogue', [VehiculeController::class, 'catalogue']);

// ──────────────────────────────────────────────
// Routes protégées (JWT requis)
// ──────────────────────────────────────────────
Route::middleware('auth:api')->group(function () {

    // Auth
    Route::prefix('auth')->group(function () {
        Route::post('logout',          [AuthController::class, 'logout']);
        Route::post('refresh',         [AuthController::class, 'refresh']);
        Route::get('me',               [AuthController::class, 'me']);
        Route::put('password',         [AuthController::class, 'updatePassword']);
        Route::put('profile',          [AuthController::class, 'updateProfile']);
    });

    // Tableau de bord
    Route::get('dashboard', [DashboardController::class, 'index']);

    // Véhicules
    Route::get('vehicules/alertes',                    [VehiculeController::class, 'alertes']);
    Route::get('vehicules/{vehicule}/obligations',     [VehiculeController::class, 'obligations']);
    Route::post('vehicules/{vehicule}/photos',         [VehiculeController::class, 'uploadPhoto']);
    Route::apiResource('vehicules', VehiculeController::class);

    // Clients
    Route::get('clients/{client}/score',      [ClientController::class, 'score']);
    Route::get('clients/{client}/historique', [ClientController::class, 'historique']);
    Route::apiResource('clients', ClientController::class);

    // Réservations
    Route::post('reservations/{reservation}/confirmer', [ReservationController::class, 'confirmer']);
    Route::post('reservations/{reservation}/annuler',   [ReservationController::class, 'annuler']);
    Route::apiResource('reservations', ReservationController::class);

    // Contrats
    Route::post('contrats/generer',                 [ContratController::class, 'generer']);
    Route::post('contrats/{contrat}/signer',        [ContratController::class, 'signer']);
    Route::get('contrats',                          [ContratController::class, 'index']);
    Route::get('contrats/{contrat}',                [ContratController::class, 'show']);
    Route::put('contrats/{contrat}',                [ContratController::class, 'update']);

    // Paiements
    Route::get('paiements/impayes',  [PaiementController::class, 'impayés']);
    Route::apiResource('paiements',  PaiementController::class)->only(['index', 'store', 'show']);

    // Retours
    Route::apiResource('retours', RetourController::class)->only(['index', 'store', 'show']);

    // Maintenances
    Route::post('maintenances/{maintenance}/terminer', [MaintenanceController::class, 'terminer']);
    Route::apiResource('maintenances', MaintenanceController::class)->except(['destroy']);

    // Gestion utilisateurs (admin seulement)
    Route::middleware('role:administrateur')->group(function () {
        Route::apiResource('users', UserController::class);
    });

    // Recherche globale
    Route::get('search', SearchController::class);

    // Calendrier de disponibilité
    Route::get('calendrier', [CalendrierController::class, 'index']);

    // Réclamations
    Route::apiResource('reclamations', ReclamationController::class);

    // Rapport employés (admin)
    Route::get('dashboard/rapport-employes', [DashboardController::class, 'rapportEmployes']);

    // Notifications in-app
    Route::prefix('notifications')->group(function () {
        Route::get('/',                            [NotificationController::class, 'index']);
        Route::post('tout-lire',                   [NotificationController::class, 'marquerToutLu']);
        Route::post('{notification}/lire',         [NotificationController::class, 'marquerLu']);
        Route::delete('{notification}',            [NotificationController::class, 'destroy']);
    });

    // Export PDF
    Route::prefix('pdf')->group(function () {
        Route::get('contrat/{contrat}',            [PdfController::class, 'contrat']);
        Route::get('rapport-mensuel',              [PdfController::class, 'rapportMensuel']);
    });

    // IA & Analytique
    Route::prefix('analytique')->group(function () {
        Route::get('resume',                     [AnalytiqueController::class, 'resumeAnalytique']);
        Route::post('prevision-demande',         [AnalytiqueController::class, 'previsionDemande']);
        Route::post('tarification-dynamique',    [AnalytiqueController::class, 'tarificationDynamique']);
        Route::post('scoring-client',            [AnalytiqueController::class, 'scoringClient']);
        Route::post('recommandation-vehicule',   [AnalytiqueController::class, 'recommandationVehicule']);
    });
});
