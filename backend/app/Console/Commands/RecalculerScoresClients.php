<?php

namespace App\Console\Commands;

use App\Models\Client;
use Illuminate\Console\Command;

class RecalculerScoresClients extends Command
{
    protected $signature   = 'clients:recalculer-scores';
    protected $description = 'Recalcule le score de fiabilité de tous les clients';

    public function handle(): int
    {
        $clients = Client::with([
            'reservations.contrat.paiements',
            'reservations.contrat.retour',
        ])->get();

        $bar = $this->output->createProgressBar($clients->count());
        $bar->start();

        foreach ($clients as $client) {
            $client->recalculerScore();
            $bar->advance();
        }

        $bar->finish();
        $this->newLine();
        $this->info("Scores recalculés pour {$clients->count()} clients.");

        return self::SUCCESS;
    }
}
