<?php

namespace Database\Seeders;

use App\Models\Client;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class MarocUsersClientsSeeder extends Seeder
{
    public function run(): void
    {
        // ── Administrateur ──────────────────────────────────────────────────
        User::firstOrCreate(['email' => 'admin@autoloc.ma'], [
            'name'      => 'Bennani',
            'prenom'    => 'Omar',
            'password'  => Hash::make('Admin@1234'),
            'role'      => 'administrateur',
            'statut'    => 'actif',
            'telephone' => '0661-12-34-56',
        ]);

        // ── Employés ────────────────────────────────────────────────────────
        User::firstOrCreate(['email' => 'youssef@autoloc.ma'], [
            'name'      => 'El Alami',
            'prenom'    => 'Youssef',
            'password'  => Hash::make('Employe@1234'),
            'role'      => 'employe',
            'statut'    => 'actif',
            'telephone' => '0662-23-45-67',
        ]);

        User::firstOrCreate(['email' => 'fatima@autoloc.ma'], [
            'name'      => 'Tazi',
            'prenom'    => 'Fatima',
            'password'  => Hash::make('Employe@1234'),
            'role'      => 'employe',
            'statut'    => 'actif',
            'telephone' => '0663-34-56-78',
        ]);

        User::firstOrCreate(['email' => 'khalid@autoloc.ma'], [
            'name'      => 'Berrada',
            'prenom'    => 'Khalid',
            'password'  => Hash::make('Employe@1234'),
            'role'      => 'employe',
            'statut'    => 'actif',
            'telephone' => '0664-45-67-89',
        ]);

        // ── Clients ─────────────────────────────────────────────────────────
        $clients = [
            // VIP
            [
                'name' => 'Chraibi',   'prenom' => 'Mohamed',  'email' => 'med.chraibi@gmail.com',
                'tel'  => '0612-11-22-33', 'cni' => 'BE123456', 'permis' => 'MA1234501',
                'dob'  => '1985-03-15', 'adresse' => '12, Rue Moulay Youssef', 'ville' => 'Casablanca',
                'score' => 88, 'segment' => 'vip',
            ],
            [
                'name' => 'Lahlou',    'prenom' => 'Zineb',    'email' => 'zineb.lahlou@gmail.com',
                'tel'  => '0613-22-33-44', 'cni' => 'A456789',  'permis' => 'MA1234502',
                'dob'  => '1990-07-22', 'adresse' => '8, Avenue Hassan II',  'ville' => 'Rabat',
                'score' => 80, 'segment' => 'vip',
            ],
            [
                'name' => 'Bennani',   'prenom' => 'Rachid',   'email' => 'rachid.bennani@yahoo.fr',
                'tel'  => '0614-33-44-55', 'cni' => 'BJ567890', 'permis' => 'MA1234503',
                'dob'  => '1982-11-08', 'adresse' => '45, Boulevard Mohammed V',  'ville' => 'Marrakech',
                'score' => 82, 'segment' => 'vip',
            ],
            [
                'name' => 'Hajji',     'prenom' => 'Khadija',  'email' => 'khadija.hajji@hotmail.com',
                'tel'  => '0615-44-55-66', 'cni' => 'BE789012', 'permis' => 'MA1234504',
                'dob'  => '1988-05-30', 'adresse' => '3, Rue Ibn Batouta',  'ville' => 'Casablanca',
                'score' => 85, 'segment' => 'vip',
            ],
            // Standard
            [
                'name' => 'Guerraoui', 'prenom' => 'Hassan',   'email' => 'hassan.guerraoui@gmail.com',
                'tel'  => '0616-55-66-77', 'cni' => 'F234567',  'permis' => 'MA1234505',
                'dob'  => '1979-09-12', 'adresse' => '17, Quartier Al Fath',  'ville' => 'Fès',
                'score' => 65, 'segment' => 'standard',
            ],
            [
                'name' => 'El Idrissi','prenom' => 'Sara',     'email' => 'sara.elidrissi@gmail.com',
                'tel'  => '0617-66-77-88', 'cni' => 'Z345678',  'permis' => 'MA1234506',
                'dob'  => '1993-02-18', 'adresse' => '22, Avenue du Souss',  'ville' => 'Agadir',
                'score' => 58, 'segment' => 'standard',
            ],
            [
                'name' => 'Zouak',     'prenom' => 'Imane',    'email' => 'imane.zouak@gmail.com',
                'tel'  => '0618-77-88-99', 'cni' => 'I456789',  'permis' => 'MA1234507',
                'dob'  => '1995-06-25', 'adresse' => '9, Rue de Fès',  'ville' => 'Tanger',
                'score' => 55, 'segment' => 'standard',
            ],
            [
                'name' => 'Moussaoui', 'prenom' => 'Omar',     'email' => 'omar.moussaoui@gmail.com',
                'tel'  => '0619-88-99-00', 'cni' => 'BE901234', 'permis' => 'MA1234508',
                'dob'  => '1987-12-03', 'adresse' => '56, Rue des Orangers',  'ville' => 'Casablanca',
                'score' => 48, 'segment' => 'standard',
            ],
            [
                'name' => 'Fassi',     'prenom' => 'Karim',    'email' => 'karim.fassi@yahoo.fr',
                'tel'  => '0621-11-00-99', 'cni' => 'M123456',  'permis' => 'MA1234509',
                'dob'  => '1980-04-19', 'adresse' => '31, Quartier Hamria',  'ville' => 'Meknès',
                'score' => 70, 'segment' => 'standard',
            ],
            [
                'name' => 'Benhaddou', 'prenom' => 'Ahmed',    'email' => 'ahmed.benhaddou@gmail.com',
                'tel'  => '0622-22-11-00', 'cni' => 'G567890',  'permis' => 'MA1234510',
                'dob'  => '1991-08-27', 'adresse' => '14, Boulevard Al Kods',  'ville' => 'Kénitra',
                'score' => 45, 'segment' => 'standard',
            ],
            [
                'name' => 'Kabbaj',    'prenom' => 'Ayoub',    'email' => 'ayoub.kabbaj@gmail.com',
                'tel'  => '0623-33-22-11', 'cni' => 'BE234567', 'permis' => 'MA1234511',
                'dob'  => '1996-01-14', 'adresse' => '7, Allée des Roses',  'ville' => 'Casablanca',
                'score' => 60, 'segment' => 'standard',
            ],
            [
                'name' => 'Sebti',     'prenom' => 'Samira',   'email' => 'samira.sebti@hotmail.com',
                'tel'  => '0624-44-33-22', 'cni' => 'D345678',  'permis' => 'MA1234512',
                'dob'  => '1989-10-07', 'adresse' => '28, Avenue Fal Ould Oumeir',  'ville' => 'Rabat',
                'score' => 52, 'segment' => 'standard',
            ],
            // À risque
            [
                'name' => 'Doukkali',  'prenom' => 'Nadia',    'email' => 'nadia.doukkali@gmail.com',
                'tel'  => '0625-55-44-33', 'cni' => 'BE456789', 'permis' => 'MA1234513',
                'dob'  => '1997-03-21', 'adresse' => '11, Rue Moussa Ibn Noussair',  'ville' => 'Casablanca',
                'score' => 32, 'segment' => 'risque',
            ],
            [
                'name' => 'Amrani',    'prenom' => 'Houda',    'email' => 'houda.amrani@gmail.com',
                'tel'  => '0626-66-55-44', 'cni' => 'F890123',  'permis' => 'MA1234514',
                'dob'  => '1994-07-09', 'adresse' => '63, Derb El Horria',  'ville' => 'Fès',
                'score' => 28, 'segment' => 'risque',
            ],
            [
                'name' => 'El Harti',  'prenom' => 'Mehdi',    'email' => 'mehdi.elharti@yahoo.fr',
                'tel'  => '0627-77-66-55', 'cni' => 'I234567',  'permis' => 'MA1234515',
                'dob'  => '1992-11-30', 'adresse' => '4, Avenue Ibn Khaldoun',  'ville' => 'Tanger',
                'score' => 38, 'segment' => 'risque',
            ],
        ];

        foreach ($clients as $data) {
            $user = User::firstOrCreate(['email' => $data['email']], [
                'name'      => $data['name'],
                'prenom'    => $data['prenom'],
                'password'  => Hash::make('Client@1234'),
                'role'      => 'client',
                'statut'    => 'actif',
                'telephone' => $data['tel'],
            ]);

            Client::firstOrCreate(['user_id' => $user->id], [
                'numero_cni'      => $data['cni'],
                'numero_permis'   => $data['permis'],
                'date_naissance'  => $data['dob'],
                'adresse'         => $data['adresse'],
                'ville'           => $data['ville'],
                'telephone'       => $data['tel'],
                'score_fiabilite' => $data['score'],
                'segment'         => $data['segment'],
            ]);
        }
    }
}
