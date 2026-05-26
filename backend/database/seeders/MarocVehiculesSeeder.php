<?php

namespace Database\Seeders;

use App\Models\Vehicule;
use Illuminate\Database\Seeder;

/**
 * Parc automobile basé sur le marché réel de la location au Maroc.
 * Prix en MAD. Sources : Hertz Maroc, Europcar Maroc, Sixt Maroc, agences locales (2025-2026).
 */
class MarocVehiculesSeeder extends Seeder
{
    public function run(): void
    {
        $parc = [
            // ── ÉCONOMIQUE (200–270 MAD/j) ──────────────────────────────────
            [
                'immatriculation' => '54321-W-22', 'marque' => 'Dacia',    'modele' => 'Sandero 1.0 SCe',
                'annee' => 2022, 'couleur' => 'Blanc',   'categorie' => 'economique',
                'km' => 45200,  'tarif' => 220.00, 'depot' => 2500.00,
                'places' => 5,  'boite' => 'manuelle', 'statut' => 'disponible',
                'vidange_km_dern' => 40000, 'vidange_km_proc' => 50000,
                'vidange_mois_dern' => -4,  'vidange_mois_proc' => 2,
                'visite_mois_dern'  => -8,  'visite_mois_proc'  => 4,
                'vignette_annee' => 2026, 'vignette_payee' => true,
            ],
            [
                'immatriculation' => '12785-W-23', 'marque' => 'Renault',  'modele' => 'Clio V 1.0 TCe',
                'annee' => 2023, 'couleur' => 'Rouge',   'categorie' => 'economique',
                'km' => 27800,  'tarif' => 255.00, 'depot' => 2500.00,
                'places' => 5,  'boite' => 'manuelle', 'statut' => 'disponible',
                'vidange_km_dern' => 23000, 'vidange_km_proc' => 33000,
                'vidange_mois_dern' => -3,  'vidange_mois_proc' => 3,
                'visite_mois_dern'  => -6,  'visite_mois_proc'  => 6,
                'vignette_annee' => 2026, 'vignette_payee' => true,
            ],
            [
                'immatriculation' => '43210-A-21', 'marque' => 'Hyundai',  'modele' => 'i10 1.0',
                'annee' => 2021, 'couleur' => 'Gris',    'categorie' => 'economique',
                'km' => 63000,  'tarif' => 195.00, 'depot' => 2000.00,
                'places' => 5,  'boite' => 'manuelle', 'statut' => 'disponible',
                'vidange_km_dern' => 58000, 'vidange_km_proc' => 68000,
                'vidange_mois_dern' => -2,  'vidange_mois_proc' => 4,
                'visite_mois_dern'  => -5,  'visite_mois_proc'  => 7,
                'vignette_annee' => 2026, 'vignette_payee' => true,
            ],
            [
                'immatriculation' => '98765-D-22', 'marque' => 'Peugeot',  'modele' => '208 1.2 PureTech',
                'annee' => 2022, 'couleur' => 'Bleu',    'categorie' => 'economique',
                'km' => 38500,  'tarif' => 265.00, 'depot' => 3000.00,
                'places' => 5,  'boite' => 'manuelle', 'statut' => 'disponible',
                'vidange_km_dern' => 33000, 'vidange_km_proc' => 43000,
                'vidange_mois_dern' => -3,  'vidange_mois_proc' => 3,
                'visite_mois_dern'  => -7,  'visite_mois_proc'  => 5,
                'vignette_annee' => 2026, 'vignette_payee' => true,
            ],
            [
                'immatriculation' => '11234-W-21', 'marque' => 'Fiat',     'modele' => 'Tipo 1.4',
                'annee' => 2021, 'couleur' => 'Blanc',   'categorie' => 'economique',
                'km' => 55000,  'tarif' => 235.00, 'depot' => 2500.00,
                'places' => 5,  'boite' => 'manuelle', 'statut' => 'disponible',
                'vidange_km_dern' => 50000, 'vidange_km_proc' => 60000,
                'vidange_mois_dern' => -5,  'vidange_mois_proc' => 1,
                'visite_mois_dern'  => -6,  'visite_mois_proc'  => 6,
                'vignette_annee' => 2026, 'vignette_payee' => true,
            ],
            // ── COMPACTE (265–350 MAD/j) ─────────────────────────────────────
            [
                'immatriculation' => '65432-D-20', 'marque' => 'Dacia',    'modele' => 'Logan MCV 1.5 dCi',
                'annee' => 2020, 'couleur' => 'Gris',    'categorie' => 'compacte',
                'km' => 74000,  'tarif' => 265.00, 'depot' => 3000.00,
                'places' => 5,  'boite' => 'manuelle', 'statut' => 'disponible',
                'vidange_km_dern' => 69000, 'vidange_km_proc' => 79000,
                'vidange_mois_dern' => -2,  'vidange_mois_proc' => 4,
                'visite_mois_dern'  => -4,  'visite_mois_proc'  => 8,
                'vignette_annee' => 2026, 'vignette_payee' => true,
            ],
            [
                'immatriculation' => '32198-W-22', 'marque' => 'Volkswagen','modele' => 'Polo 1.0 TSI',
                'annee' => 2022, 'couleur' => 'Argent',  'categorie' => 'compacte',
                'km' => 41000,  'tarif' => 315.00, 'depot' => 3500.00,
                'places' => 5,  'boite' => 'manuelle', 'statut' => 'disponible',
                'vidange_km_dern' => 36000, 'vidange_km_proc' => 46000,
                'vidange_mois_dern' => -4,  'vidange_mois_proc' => 2,
                'visite_mois_dern'  => -8,  'visite_mois_proc'  => 4,
                'vignette_annee' => 2026, 'vignette_payee' => true,
            ],
            [
                'immatriculation' => '87654-J-23', 'marque' => 'Renault',  'modele' => 'Mégane IV 1.3 TCe',
                'annee' => 2023, 'couleur' => 'Noir',    'categorie' => 'compacte',
                'km' => 22000,  'tarif' => 330.00, 'depot' => 4000.00,
                'places' => 5,  'boite' => 'manuelle', 'statut' => 'disponible',
                'vidange_km_dern' => 17000, 'vidange_km_proc' => 27000,
                'vidange_mois_dern' => -3,  'vidange_mois_proc' => 3,
                'visite_mois_dern'  => -6,  'visite_mois_proc'  => 6,
                'vignette_annee' => 2026, 'vignette_payee' => true,
            ],
            [
                'immatriculation' => '21345-D-22', 'marque' => 'Peugeot',  'modele' => '308 1.2 PureTech 130',
                'annee' => 2022, 'couleur' => 'Blanc',   'categorie' => 'compacte',
                'km' => 36000,  'tarif' => 345.00, 'depot' => 4000.00,
                'places' => 5,  'boite' => 'automatique', 'statut' => 'disponible',
                'vidange_km_dern' => 31000, 'vidange_km_proc' => 41000,
                'vidange_mois_dern' => -5,  'vidange_mois_proc' => 1,
                'visite_mois_dern'  => -5,  'visite_mois_proc'  => 7,
                'vignette_annee' => 2026, 'vignette_payee' => true,
            ],
            // ── BERLINE (420–480 MAD/j) ──────────────────────────────────────
            [
                'immatriculation' => '76543-A-23', 'marque' => 'Toyota',   'modele' => 'Corolla 2.0 Hybrid',
                'annee' => 2023, 'couleur' => 'Argent',  'categorie' => 'berline',
                'km' => 19000,  'tarif' => 425.00, 'depot' => 5000.00,
                'places' => 5,  'boite' => 'automatique', 'statut' => 'loue',
                'vidange_km_dern' => 15000, 'vidange_km_proc' => 25000,
                'vidange_mois_dern' => -2,  'vidange_mois_proc' => 4,
                'visite_mois_dern'  => -4,  'visite_mois_proc'  => 8,
                'vignette_annee' => 2026, 'vignette_payee' => true,
            ],
            [
                'immatriculation' => '43789-W-21', 'marque' => 'Volkswagen','modele' => 'Passat 2.0 TDI',
                'annee' => 2021, 'couleur' => 'Noir',    'categorie' => 'berline',
                'km' => 44000,  'tarif' => 475.00, 'depot' => 5500.00,
                'places' => 5,  'boite' => 'automatique', 'statut' => 'loue',
                'vidange_km_dern' => 39000, 'vidange_km_proc' => 49000,
                'vidange_mois_dern' => -3,  'vidange_mois_proc' => 3,
                'visite_mois_dern'  => -6,  'visite_mois_proc'  => 6,
                'vignette_annee' => 2026, 'vignette_payee' => true,
            ],
            [
                'immatriculation' => '25678-D-22', 'marque' => 'Peugeot',  'modele' => '508 SW 1.6 BlueHDi',
                'annee' => 2022, 'couleur' => 'Bleu',    'categorie' => 'berline',
                'km' => 39000,  'tarif' => 450.00, 'depot' => 5000.00,
                'places' => 5,  'boite' => 'automatique', 'statut' => 'loue',
                'vidange_km_dern' => 34000, 'vidange_km_proc' => 44000,
                'vidange_mois_dern' => -4,  'vidange_mois_proc' => 2,
                'visite_mois_dern'  => -7,  'visite_mois_proc'  => 5,
                'vignette_annee' => 2026, 'vignette_payee' => true,
            ],
            // ── SUV (385–590 MAD/j) ──────────────────────────────────────────
            [
                'immatriculation' => '87321-A-22', 'marque' => 'Dacia',    'modele' => 'Duster 1.5 dCi 4x4',
                'annee' => 2022, 'couleur' => 'Orange',  'categorie' => 'suv',
                'km' => 51000,  'tarif' => 385.00, 'depot' => 4500.00,
                'places' => 5,  'boite' => 'manuelle', 'statut' => 'loue',
                'vidange_km_dern' => 46000, 'vidange_km_proc' => 56000,
                'vidange_mois_dern' => -2,  'vidange_mois_proc' => 4,
                'visite_mois_dern'  => -5,  'visite_mois_proc'  => 7,
                'vignette_annee' => 2026, 'vignette_payee' => true,
            ],
            [
                'immatriculation' => '54678-W-23', 'marque' => 'Hyundai',  'modele' => 'Tucson 1.6 CRDi',
                'annee' => 2023, 'couleur' => 'Blanc',   'categorie' => 'suv',
                'km' => 24000,  'tarif' => 530.00, 'depot' => 6000.00,
                'places' => 5,  'boite' => 'automatique', 'statut' => 'loue',
                'vidange_km_dern' => 19000, 'vidange_km_proc' => 29000,
                'vidange_mois_dern' => -3,  'vidange_mois_proc' => 3,
                'visite_mois_dern'  => -5,  'visite_mois_proc'  => 7,
                'vignette_annee' => 2026, 'vignette_payee' => true,
            ],
            [
                'immatriculation' => '32456-J-22', 'marque' => 'Kia',      'modele' => 'Sportage 1.6 T-GDi',
                'annee' => 2022, 'couleur' => 'Gris',    'categorie' => 'suv',
                'km' => 37000,  'tarif' => 495.00, 'depot' => 6000.00,
                'places' => 5,  'boite' => 'automatique', 'statut' => 'disponible',
                'vidange_km_dern' => 32000, 'vidange_km_proc' => 42000,
                'vidange_mois_dern' => -4,  'vidange_mois_proc' => 2,
                'visite_mois_dern'  => -8,  'visite_mois_proc'  => 4,
                'vignette_annee' => 2026, 'vignette_payee' => true,
            ],
            [
                'immatriculation' => '19876-A-23', 'marque' => 'Toyota',   'modele' => 'RAV4 2.5 Hybrid',
                'annee' => 2023, 'couleur' => 'Blanc',   'categorie' => 'suv',
                'km' => 16000,  'tarif' => 585.00, 'depot' => 7000.00,
                'places' => 5,  'boite' => 'automatique', 'statut' => 'loue',
                'vidange_km_dern' => 11000, 'vidange_km_proc' => 21000,
                'vidange_mois_dern' => -2,  'vidange_mois_proc' => 4,
                'visite_mois_dern'  => -4,  'visite_mois_proc'  => 8,
                'vignette_annee' => 2026, 'vignette_payee' => true,
            ],
            // ── UTILITAIRE (365–490 MAD/j) ───────────────────────────────────
            [
                'immatriculation' => '65109-D-21', 'marque' => 'Renault',  'modele' => 'Kangoo 1.5 dCi L2',
                'annee' => 2021, 'couleur' => 'Blanc',   'categorie' => 'utilitaire',
                'km' => 82000,  'tarif' => 365.00, 'depot' => 4000.00,
                'places' => 2,  'boite' => 'manuelle', 'statut' => 'en_maintenance',
                'vidange_km_dern' => 77000, 'vidange_km_proc' => 82000,
                'vidange_mois_dern' => -1,  'vidange_mois_proc' => -1,
                'visite_mois_dern'  => -12, 'visite_mois_proc'  => 0,
                'vignette_annee' => 2026, 'vignette_payee' => true,
            ],
            [
                'immatriculation' => '88765-W-22', 'marque' => 'Fiat',     'modele' => 'Ducato 2.3 JTD L2H2',
                'annee' => 2022, 'couleur' => 'Blanc',   'categorie' => 'utilitaire',
                'km' => 61000,  'tarif' => 490.00, 'depot' => 5500.00,
                'places' => 3,  'boite' => 'manuelle', 'statut' => 'en_maintenance',
                'vidange_km_dern' => 56000, 'vidange_km_proc' => 66000,
                'vidange_mois_dern' => -6,  'vidange_mois_proc' => 0,
                'visite_mois_dern'  => -6,  'visite_mois_proc'  => 6,
                'vignette_annee' => 2026, 'vignette_payee' => true,
            ],
            // ── LUXE (1150–1250 MAD/j) ───────────────────────────────────────
            [
                'immatriculation' => '14523-W-23', 'marque' => 'Mercedes-Benz','modele' => 'Classe C 220d AMG Line',
                'annee' => 2023, 'couleur' => 'Noir',    'categorie' => 'luxe',
                'km' => 21000,  'tarif' => 1250.00, 'depot' => 12000.00,
                'places' => 5,  'boite' => 'automatique', 'statut' => 'disponible',
                'vidange_km_dern' => 16000, 'vidange_km_proc' => 26000,
                'vidange_mois_dern' => -2,  'vidange_mois_proc' => 4,
                'visite_mois_dern'  => -4,  'visite_mois_proc'  => 8,
                'vignette_annee' => 2026, 'vignette_payee' => true,
            ],
            [
                'immatriculation' => '92341-D-22', 'marque' => 'BMW',       'modele' => 'Série 3 320i M Sport',
                'annee' => 2022, 'couleur' => 'Argent',  'categorie' => 'luxe',
                'km' => 31000,  'tarif' => 1150.00, 'depot' => 11000.00,
                'places' => 5,  'boite' => 'automatique', 'statut' => 'hors_service',
                'vidange_km_dern' => 26000, 'vidange_km_proc' => 36000,
                'vidange_mois_dern' => -8,  'vidange_mois_proc' => -2,
                'visite_mois_dern'  => -14, 'visite_mois_proc'  => -2,
                'vignette_annee' => 2025, 'vignette_payee' => false,
            ],
        ];

        foreach ($parc as $v) {
            Vehicule::firstOrCreate(['immatriculation' => $v['immatriculation']], [
                'marque'                          => $v['marque'],
                'modele'                          => $v['modele'],
                'annee'                           => $v['annee'],
                'couleur'                         => $v['couleur'],
                'categorie'                       => $v['categorie'],
                'kilometrage'                     => $v['km'],
                'statut'                          => $v['statut'],
                'tarif_journalier'                => $v['tarif'],
                'depot_garantie'                  => $v['depot'],
                'niveau_carburant'                => 100,
                'nombre_places'                   => $v['places'],
                'boite_vitesse'                   => $v['boite'],
                'derniere_vidange_km'             => $v['vidange_km_dern'],
                'prochaine_vidange_km'            => $v['vidange_km_proc'],
                'derniere_vidange_date'           => now()->addMonths($v['vidange_mois_dern']),
                'prochaine_vidange_date'          => now()->addMonths($v['vidange_mois_proc']),
                'derniere_visite_technique_date'  => now()->addMonths($v['visite_mois_dern']),
                'prochaine_visite_technique_date' => now()->addMonths($v['visite_mois_proc']),
                'vignette_annee'                  => $v['vignette_annee'],
                'vignette_payee'                  => $v['vignette_payee'],
                'vignette_date_paiement'          => $v['vignette_payee'] ? now()->startOfYear() : null,
            ]);
        }
    }
}
