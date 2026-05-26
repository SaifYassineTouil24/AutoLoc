<?php

namespace App\Console\Commands;

use App\Mail\RappelRetour;
use App\Models\AppNotification;
use App\Models\Contrat;
use App\Models\Reservation;
use App\Models\Vehicule;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

class GenererNotifications extends Command
{
    protected $signature   = 'notifications:generer';
    protected $description = 'Génère les notifications automatiques (rappels, retards, expirations)';

    public function handle(): int
    {
        $count = 0;

        $count += $this->rappelsReservation();
        $count += $this->paiementsEnRetard();
        $count += $this->contratsExpirants();
        $count += $this->maintenancesDues();

        $this->info("{$count} notification(s) générée(s).");
        return self::SUCCESS;
    }

    private function rappelsReservation(): int
    {
        $demain = Carbon::tomorrow();

        $reservations = Reservation::with(['client.user', 'vehicule'])
            ->whereDate('date_debut', $demain)
            ->whereIn('statut', ['confirmee', 'en_cours'])
            ->get();

        $count = 0;
        foreach ($reservations as $r) {
            if (!$r->client?->user_id) continue;

            $alreadyExists = AppNotification::where('user_id', $r->client->user_id)
                ->where('type', 'reservation_rappel')
                ->where('lien', '/reservations/' . $r->id)
                ->whereDate('created_at', today())
                ->exists();

            if ($alreadyExists) continue;

            AppNotification::create([
                'user_id'  => $r->client->user_id,
                'type'     => 'reservation_rappel',
                'priorite' => 'haute',
                'titre'    => 'Rappel : location demain',
                'message'  => "Votre location de {$r->vehicule->marque} {$r->vehicule->modele} commence le " . $demain->format('d/m/Y') . '.',
                'lien'     => '/reservations/' . $r->id,
            ]);
            $count++;
        }

        return $count;
    }

    private function paiementsEnRetard(): int
    {
        $contrats = Contrat::with(['reservation.client.user'])
            ->where('statut', 'signe')
            ->whereHas('paiements', fn ($q) => $q->where('statut', 'en_retard'))
            ->get();

        $count = 0;
        foreach ($contrats as $c) {
            $userId = $c->reservation?->client?->user_id;
            if (!$userId) continue;

            $alreadyExists = AppNotification::where('user_id', $userId)
                ->where('type', 'paiement_retard')
                ->where('lien', '/contrats/' . $c->id)
                ->whereDate('created_at', today())
                ->exists();

            if ($alreadyExists) continue;

            AppNotification::create([
                'user_id'  => $userId,
                'type'     => 'paiement_retard',
                'priorite' => 'haute',
                'titre'    => 'Paiement en retard',
                'message'  => "Un paiement est en retard sur le contrat {$c->numero_contrat}. Merci de régulariser votre situation.",
                'lien'     => '/contrats/' . $c->id,
            ]);
            $count++;
        }

        return $count;
    }

    private function contratsExpirants(): int
    {
        $dans3jours = Carbon::now()->addDays(3);

        $reservations = Reservation::with(['client.user', 'vehicule'])
            ->whereDate('date_fin', $dans3jours->toDateString())
            ->where('statut', 'en_cours')
            ->get();

        $count = 0;
        foreach ($reservations as $r) {
            $userId = $r->client?->user_id;
            if (!$userId) continue;

            $alreadyExists = AppNotification::where('user_id', $userId)
                ->where('type', 'contrat_expirant')
                ->where('lien', '/reservations/' . $r->id)
                ->whereDate('created_at', today())
                ->exists();

            if ($alreadyExists) continue;

            AppNotification::create([
                'user_id'  => $userId,
                'type'     => 'contrat_expirant',
                'priorite' => 'normale',
                'titre'    => 'Contrat expirant dans 3 jours',
                'message'  => "Votre location de {$r->vehicule->marque} {$r->vehicule->modele} se termine le " . $r->date_fin->format('d/m/Y') . '.',
                'lien'     => '/reservations/' . $r->id,
            ]);

            // Send reminder email on J-1
            if ($r->date_fin->isNextDay() || Carbon::tomorrow()->isSameDay($r->date_fin)) {
                try { Mail::to($r->client->user->email)->queue(new RappelRetour($r)); } catch (\Throwable) {}
            }

            $count++;
        }

        return $count;
    }

    private function maintenancesDues(): int
    {
        $vehicules = Vehicule::all();
        $count = 0;

        foreach ($vehicules as $v) {
            $obligations = $v->statutObligations();
            $enRetard    = collect($obligations)->filter(fn ($s) => $s === 'en_retard')->count();

            if ($enRetard === 0) continue;

            // Notify all admins/employes
            $users = \App\Models\User::whereHas('roles', fn ($q) =>
                $q->whereIn('name', ['administrateur', 'employe'])
            )->get();

            foreach ($users as $u) {
                $alreadyExists = AppNotification::where('user_id', $u->id)
                    ->where('type', 'maintenance_due')
                    ->where('lien', '/vehicules/' . $v->id)
                    ->whereDate('created_at', today())
                    ->exists();

                if ($alreadyExists) continue;

                AppNotification::create([
                    'user_id'  => $u->id,
                    'type'     => 'maintenance_due',
                    'priorite' => 'haute',
                    'titre'    => 'Maintenance requise',
                    'message'  => "{$v->marque} {$v->modele} ({$v->immatriculation}) a {$enRetard} obligation(s) en retard.",
                    'lien'     => '/vehicules/' . $v->id,
                ]);
                $count++;
            }
        }

        return $count;
    }
}
