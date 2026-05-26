<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            MarocUsersClientsSeeder::class,
            MarocVehiculesSeeder::class,
            MarocHistoriqueSeeder::class,
            MarocMaintenanceSeeder::class,
        ]);
    }
}
