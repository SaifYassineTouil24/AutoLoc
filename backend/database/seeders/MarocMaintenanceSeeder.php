<?php

namespace Database\Seeders;

use App\Models\Maintenance;
use App\Models\Vehicule;
use Illuminate\Database\Seeder;

class MarocMaintenanceSeeder extends Seeder
{
    public function run(): void
    {
        $v = fn ($immat) => Vehicule::where('immatriculation', $immat)->value('id');

        $records = [
            // ── Terminées (historique) ────────────────────────────────────────
            [
                'vehicule_id' => $v('54321-W-22'), 'type' => 'vidange',
                'description' => 'Vidange huile moteur + filtre à huile',
                'date_prevue' => '2025-11-01', 'date_effective' => '2025-11-03',
                'km_ref' => 40000, 'km_eff' => 40200,
                'prestataire' => 'Auto Express Casablanca', 'cout' => 350.00,
                'statut' => 'terminee', 'duree' => 1,
            ],
            [
                'vehicule_id' => $v('54678-W-23'), 'type' => 'revision',
                'description' => 'Révision complète 20 000 km',
                'date_prevue' => '2025-12-10', 'date_effective' => '2025-12-12',
                'km_ref' => 19000, 'km_eff' => 19200,
                'prestataire' => 'Hyundai Service Casablanca', 'cout' => 1200.00,
                'statut' => 'terminee', 'duree' => 2,
            ],
            [
                'vehicule_id' => $v('32456-J-22'), 'type' => 'pneus',
                'description' => 'Remplacement 4 pneus Michelin Energy Saver',
                'date_prevue' => '2026-01-15', 'date_effective' => '2026-01-16',
                'km_ref' => 37000, 'km_eff' => 37100,
                'prestataire' => 'Pneu Express Fès', 'cout' => 2800.00,
                'statut' => 'terminee', 'duree' => 1,
            ],
            [
                'vehicule_id' => $v('14523-W-23'), 'type' => 'revision',
                'description' => 'Révision complète + remplacement disques de frein avant',
                'date_prevue' => '2026-02-01', 'date_effective' => '2026-02-03',
                'km_ref' => 20000, 'km_eff' => 20100,
                'prestataire' => 'Mercedes-Benz Service Casablanca', 'cout' => 3500.00,
                'statut' => 'terminee', 'duree' => 2,
            ],
            [
                'vehicule_id' => $v('76543-A-23'), 'type' => 'visite_technique',
                'description' => 'Contrôle technique périodique',
                'date_prevue' => '2025-11-20', 'date_effective' => '2025-11-20',
                'km_ref' => 17000, 'km_eff' => 17050,
                'prestataire' => 'Centre de Contrôle Technique Marrakech', 'cout' => 180.00,
                'statut' => 'terminee', 'duree' => 0,
            ],
            [
                'vehicule_id' => $v('43789-W-21'), 'type' => 'freins',
                'description' => 'Remplacement plaquettes et disques avant + arrière',
                'date_prevue' => '2026-02-10', 'date_effective' => '2026-02-11',
                'km_ref' => 43000, 'km_eff' => 43100,
                'prestataire' => 'Garage Choukri – Casablanca', 'cout' => 1800.00,
                'statut' => 'terminee', 'duree' => 1,
            ],
            [
                'vehicule_id' => $v('65109-D-21'), 'type' => 'vidange',
                'description' => 'Vidange huile + filtre air + filtre habitacle',
                'date_prevue' => '2026-01-08', 'date_effective' => '2026-01-08',
                'km_ref' => 77000, 'km_eff' => 77050,
                'prestataire' => 'Renault Service Rabat', 'cout' => 420.00,
                'statut' => 'terminee', 'duree' => 1,
            ],
            [
                'vehicule_id' => $v('21345-D-22'), 'type' => 'vidange',
                'description' => 'Vidange + filtre à huile + filtre à air',
                'date_prevue' => '2025-12-05', 'date_effective' => '2025-12-05',
                'km_ref' => 31000, 'km_eff' => 31000,
                'prestataire' => 'Peugeot Service Casablanca', 'cout' => 380.00,
                'statut' => 'terminee', 'duree' => 1,
            ],
            [
                'vehicule_id' => $v('19876-A-23'), 'type' => 'visite_technique',
                'description' => 'Contrôle technique réglementaire',
                'date_prevue' => '2026-03-05', 'date_effective' => '2026-03-05',
                'km_ref' => 14000, 'km_eff' => 14010,
                'prestataire' => 'Centre Technique Marrakech', 'cout' => 180.00,
                'statut' => 'terminee', 'duree' => 0,
            ],
            // ── En cours ──────────────────────────────────────────────────────
            [
                'vehicule_id' => $v('65109-D-21'), 'type' => 'revision',
                'description' => 'Révision 80 000 km — courroie de distribution + pompe à eau',
                'date_prevue' => '2026-05-22', 'date_effective' => null,
                'km_ref' => 82000, 'km_eff' => null,
                'prestataire' => 'Renault Service Rabat', 'cout' => 2200.00,
                'statut' => 'en_cours', 'duree' => 3,
            ],
            [
                'vehicule_id' => $v('88765-W-22'), 'type' => 'freins',
                'description' => 'Remplacement système de freinage complet',
                'date_prevue' => '2026-05-23', 'date_effective' => null,
                'km_ref' => 61000, 'km_eff' => null,
                'prestataire' => 'Fiat Service Casablanca', 'cout' => 2500.00,
                'statut' => 'en_cours', 'duree' => 2,
            ],
            // ── Planifiées (à venir) ──────────────────────────────────────────
            [
                'vehicule_id' => $v('43210-A-21'), 'type' => 'vidange',
                'description' => 'Vidange huile moteur + remplacement filtre à huile',
                'date_prevue' => '2026-06-05', 'date_effective' => null,
                'km_ref' => 63000, 'km_eff' => null,
                'prestataire' => 'Hyundai Service Marrakech', 'cout' => 320.00,
                'statut' => 'planifiee', 'duree' => 1,
            ],
            [
                'vehicule_id' => $v('11234-W-21'), 'type' => 'vignette',
                'description' => 'Paiement vignette TSAVM 2026',
                'date_prevue' => '2026-06-10', 'date_effective' => null,
                'km_ref' => null, 'km_eff' => null,
                'prestataire' => 'Trésorerie Générale', 'cout' => 700.00,
                'statut' => 'planifiee', 'duree' => 0,
            ],
            [
                'vehicule_id' => $v('65432-D-20'), 'type' => 'visite_technique',
                'description' => 'Contrôle technique obligatoire — véhicule > 5 ans',
                'date_prevue' => '2026-06-15', 'date_effective' => null,
                'km_ref' => 74000, 'km_eff' => null,
                'prestataire' => 'Centre Technique Agréé Rabat', 'cout' => 180.00,
                'statut' => 'planifiee', 'duree' => 0,
            ],
            [
                'vehicule_id' => $v('92341-D-22'), 'type' => 'autre',
                'description' => 'Réparation carrosserie suite à accrochage + contrôle électronique',
                'date_prevue' => '2026-05-26', 'date_effective' => null,
                'km_ref' => 31000, 'km_eff' => null,
                'prestataire' => 'BMW Service Rabat', 'cout' => 8500.00,
                'statut' => 'planifiee', 'duree' => 7,
            ],
        ];

        foreach ($records as $m) {
            if (!$m['vehicule_id']) continue;

            Maintenance::create([
                'vehicule_id'              => $m['vehicule_id'],
                'type'                     => $m['type'],
                'description'              => $m['description'],
                'date_prevue'              => $m['date_prevue'],
                'date_effective'           => $m['date_effective'],
                'kilometrage_reference'    => $m['km_ref'],
                'kilometrage_effectif'     => $m['km_eff'],
                'prestataire'              => $m['prestataire'],
                'cout'                     => $m['cout'],
                'duree_immobilisation_jours' => $m['duree'],
                'statut'                   => $m['statut'],
            ]);
        }
    }
}
