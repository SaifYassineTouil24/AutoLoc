<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Recalcule les scores de fiabilité de tous les clients — toutes les nuits à 02h00
Schedule::command('clients:recalculer-scores')->dailyAt('02:00');

// Génère les notifications automatiques (rappels, retards, expirations) — toutes les heures
Schedule::command('notifications:generer')->hourly();
