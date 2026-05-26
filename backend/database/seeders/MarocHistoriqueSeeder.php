<?php

namespace Database\Seeders;

use App\Models\Client;
use App\Models\Contrat;
use App\Models\Paiement;
use App\Models\Reservation;
use App\Models\Retour;
use App\Models\User;
use App\Models\Vehicule;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class MarocHistoriqueSeeder extends Seeder
{
    private array $employes = [];
    private array $clients  = [];
    private array $vehicules = [];
    private int   $resSeq   = 0;
    private int   $ctrSeq   = 0;
    private int   $facSeq   = 0;

    public function run(): void
    {
        // Avoid re-seeding if data already exists
        if (Reservation::count() > 0) {
            $this->command->info('Historique déjà présent — skipping.');
            return;
        }

        $this->employes = User::where('role', 'employe')->pluck('id')->toArray();
        $this->vehicules = Vehicule::all()->keyBy('immatriculation')->toArray();
        $this->clients  = Client::with('user')->get()->keyBy(fn ($c) => $c->user->email)->toArray();

        $vehId  = fn ($immat) => $this->vehicules[$immat]['id'];
        $cliId  = fn ($email) => $this->clients[$email]['id'];
        $empId  = fn ()       => $this->employes[array_rand($this->employes)];

        // ── LIEUX COURANTS ──────────────────────────────────────────────────
        $lieux = [
            'Agence Casablanca – Maârif',
            'Agence Casablanca – Centre',
            'Aéroport Mohammed V (Casablanca)',
            'Agence Marrakech – Guéliz',
            'Aéroport Marrakech-Ménara',
            'Agence Rabat – Agdal',
            'Agence Agadir – Founty',
            'Aéroport Agadir-Al Massira',
            'Agence Fès – Ville Nouvelle',
            'Agence Tanger – Centre',
        ];

        // ══════════════════════════════════════════════════════════════════════
        // RÉSERVATIONS TERMINÉES (historique 6 mois)
        // ══════════════════════════════════════════════════════════════════════
        $terminees = [
            // Nov 2025
            ['immat'=>'54321-W-22','email'=>'med.chraibi@gmail.com',     'debut'=>'2025-11-05','fin'=>'2025-11-10','coef'=>1.00,'mode'=>'carte',    'assurance'=>'basique',      'etat_dep'=>'excellent','etat_ret'=>'excellent','dam'=>false,'retard'=>0,'carb_ret'=>100],
            ['immat'=>'12785-W-23','email'=>'hassan.guerraoui@gmail.com','debut'=>'2025-11-12','fin'=>'2025-11-17','coef'=>1.00,'mode'=>'especes',   'assurance'=>'basique',      'etat_dep'=>'bon',      'etat_ret'=>'bon',      'dam'=>false,'retard'=>0,'carb_ret'=>100],
            ['immat'=>'14523-W-23','email'=>'khadija.hajji@hotmail.com', 'debut'=>'2025-11-20','fin'=>'2025-11-25','coef'=>1.10,'mode'=>'carte',     'assurance'=>'tous_risques', 'etat_dep'=>'excellent','etat_ret'=>'excellent','dam'=>false,'retard'=>0,'carb_ret'=>100],
            ['immat'=>'21345-D-22','email'=>'zineb.lahlou@gmail.com',    'debut'=>'2025-11-28','fin'=>'2025-12-03','coef'=>1.00,'mode'=>'virement',  'assurance'=>'basique',      'etat_dep'=>'bon',      'etat_ret'=>'bon',      'dam'=>false,'retard'=>0,'carb_ret'=>80],
            // Déc 2025 (haute saison hivernale +15%)
            ['immat'=>'54321-W-22','email'=>'rachid.bennani@yahoo.fr',   'debut'=>'2025-12-08','fin'=>'2025-12-13','coef'=>1.15,'mode'=>'carte',     'assurance'=>'basique',      'etat_dep'=>'excellent','etat_ret'=>'bon',      'dam'=>false,'retard'=>0,'carb_ret'=>100],
            ['immat'=>'32456-J-22','email'=>'imane.zouak@gmail.com',     'debut'=>'2025-12-15','fin'=>'2025-12-20','coef'=>1.15,'mode'=>'especes',   'assurance'=>'basique',      'etat_dep'=>'bon',      'etat_ret'=>'acceptable','dam'=>false,'retard'=>0,'carb_ret'=>70],
            ['immat'=>'43210-A-21','email'=>'omar.moussaoui@gmail.com',  'debut'=>'2025-12-22','fin'=>'2025-12-27','coef'=>1.20,'mode'=>'carte',     'assurance'=>'basique',      'etat_dep'=>'bon',      'etat_ret'=>'bon',      'dam'=>false,'retard'=>0,'carb_ret'=>100],
            // Jan 2026
            ['immat'=>'12785-W-23','email'=>'nadia.doukkali@gmail.com',  'debut'=>'2026-01-03','fin'=>'2026-01-08','coef'=>1.00,'mode'=>'especes',   'assurance'=>'basique',      'etat_dep'=>'bon',      'etat_ret'=>'acceptable','dam'=>true, 'retard'=>2,'carb_ret'=>60,'dam_desc'=>'Rayure portière gauche','penalite_dam'=>500],
            ['immat'=>'32456-J-22','email'=>'karim.fassi@yahoo.fr',      'debut'=>'2026-01-10','fin'=>'2026-01-16','coef'=>1.05,'mode'=>'carte',     'assurance'=>'tous_risques', 'etat_dep'=>'bon',      'etat_ret'=>'bon',      'dam'=>false,'retard'=>0,'carb_ret'=>100],
            ['immat'=>'98765-D-22','email'=>'khadija.hajji@hotmail.com', 'debut'=>'2026-01-20','fin'=>'2026-01-25','coef'=>1.00,'mode'=>'virement',  'assurance'=>'basique',      'etat_dep'=>'excellent','etat_ret'=>'excellent','dam'=>false,'retard'=>0,'carb_ret'=>100],
            // Fév 2026
            ['immat'=>'32198-W-22','email'=>'ayoub.kabbaj@gmail.com',    'debut'=>'2026-01-28','fin'=>'2026-02-02','coef'=>1.00,'mode'=>'carte',     'assurance'=>'basique',      'etat_dep'=>'bon',      'etat_ret'=>'bon',      'dam'=>false,'retard'=>0,'carb_ret'=>100],
            ['immat'=>'11234-W-21','email'=>'samira.sebti@hotmail.com',  'debut'=>'2026-02-05','fin'=>'2026-02-10','coef'=>1.00,'mode'=>'especes',   'assurance'=>'basique',      'etat_dep'=>'acceptable','etat_ret'=>'acceptable','dam'=>false,'retard'=>0,'carb_ret'=>80],
            ['immat'=>'32456-J-22','email'=>'med.chraibi@gmail.com',     'debut'=>'2026-02-14','fin'=>'2026-02-19','coef'=>1.05,'mode'=>'carte',     'assurance'=>'tous_risques', 'etat_dep'=>'bon',      'etat_ret'=>'excellent','dam'=>false,'retard'=>0,'carb_ret'=>100],
            ['immat'=>'87654-J-23','email'=>'nadia.doukkali@gmail.com',  'debut'=>'2026-02-20','fin'=>'2026-02-25','coef'=>1.00,'mode'=>'carte',     'assurance'=>'basique',      'etat_dep'=>'bon',      'etat_ret'=>'mauvais',  'dam'=>true, 'retard'=>4,'carb_ret'=>40,'dam_desc'=>'Pare-choc avant endommagé','penalite_dam'=>1200],
            // Mars 2026
            ['immat'=>'65432-D-20','email'=>'zineb.lahlou@gmail.com',    'debut'=>'2026-03-01','fin'=>'2026-03-06','coef'=>1.05,'mode'=>'virement',  'assurance'=>'basique',      'etat_dep'=>'bon',      'etat_ret'=>'bon',      'dam'=>false,'retard'=>0,'carb_ret'=>100],
            ['immat'=>'14523-W-23','email'=>'rachid.bennani@yahoo.fr',   'debut'=>'2026-03-10','fin'=>'2026-03-15','coef'=>1.10,'mode'=>'carte',     'assurance'=>'premium',      'etat_dep'=>'excellent','etat_ret'=>'excellent','dam'=>false,'retard'=>0,'carb_ret'=>100],
            ['immat'=>'21345-D-22','email'=>'hassan.guerraoui@gmail.com','debut'=>'2026-03-20','fin'=>'2026-03-25','coef'=>1.05,'mode'=>'carte',     'assurance'=>'basique',      'etat_dep'=>'bon',      'etat_ret'=>'bon',      'dam'=>false,'retard'=>0,'carb_ret'=>100],
            // Avr 2026
            ['immat'=>'54321-W-22','email'=>'khadija.hajji@hotmail.com', 'debut'=>'2026-04-02','fin'=>'2026-04-07','coef'=>1.05,'mode'=>'carte',     'assurance'=>'basique',      'etat_dep'=>'bon',      'etat_ret'=>'excellent','dam'=>false,'retard'=>0,'carb_ret'=>100],
            ['immat'=>'32198-W-22','email'=>'imane.zouak@gmail.com',     'debut'=>'2026-04-10','fin'=>'2026-04-15','coef'=>1.05,'mode'=>'especes',   'assurance'=>'basique',      'etat_dep'=>'bon',      'etat_ret'=>'bon',      'dam'=>false,'retard'=>1,'carb_ret'=>90],
            ['immat'=>'98765-D-22','email'=>'karim.fassi@yahoo.fr',      'debut'=>'2026-04-20','fin'=>'2026-04-25','coef'=>1.05,'mode'=>'carte',     'assurance'=>'basique',      'etat_dep'=>'bon',      'etat_ret'=>'bon',      'dam'=>false,'retard'=>0,'carb_ret'=>100],
            // Mai 2026 (haute saison +20%)
            ['immat'=>'12785-W-23','email'=>'ayoub.kabbaj@gmail.com',    'debut'=>'2026-04-28','fin'=>'2026-05-03','coef'=>1.20,'mode'=>'carte',     'assurance'=>'basique',      'etat_dep'=>'bon',      'etat_ret'=>'bon',      'dam'=>false,'retard'=>0,'carb_ret'=>100],
            ['immat'=>'43210-A-21','email'=>'khadija.hajji@hotmail.com', 'debut'=>'2026-05-05','fin'=>'2026-05-10','coef'=>1.20,'mode'=>'virement',  'assurance'=>'basique',      'etat_dep'=>'bon',      'etat_ret'=>'bon',      'dam'=>false,'retard'=>0,'carb_ret'=>100],
            ['immat'=>'65432-D-20','email'=>'omar.moussaoui@gmail.com',  'debut'=>'2026-05-12','fin'=>'2026-05-17','coef'=>1.20,'mode'=>'carte',     'assurance'=>'basique',      'etat_dep'=>'acceptable','etat_ret'=>'acceptable','dam'=>false,'retard'=>0,'carb_ret'=>80],
            ['immat'=>'87654-J-23','email'=>'mehdi.elharti@yahoo.fr',    'debut'=>'2026-05-18','fin'=>'2026-05-22','coef'=>1.20,'mode'=>'especes',   'assurance'=>'basique',      'etat_dep'=>'bon',      'etat_ret'=>'acceptable','dam'=>false,'retard'=>1,'carb_ret'=>70],
            ['immat'=>'11234-W-21','email'=>'nadia.doukkali@gmail.com',  'debut'=>'2026-05-03','fin'=>'2026-05-08','coef'=>1.20,'mode'=>'carte',     'assurance'=>'basique',      'etat_dep'=>'acceptable','etat_ret'=>'mauvais',  'dam'=>true, 'retard'=>0,'carb_ret'=>50,'dam_desc'=>'Fissure vitre arrière','penalite_dam'=>800],
        ];

        foreach ($terminees as $r) {
            $this->creerReservationComplete($r, $vehId($r['immat']), $cliId($r['email']), $empId(), $lieux);
        }

        // ══════════════════════════════════════════════════════════════════════
        // EN COURS (véhicules statut=loue)
        // ══════════════════════════════════════════════════════════════════════
        $enCours = [
            ['immat'=>'76543-A-23','email'=>'med.chraibi@gmail.com',     'debut'=>'2026-05-20','fin'=>'2026-05-30','coef'=>1.20,'mode'=>'carte',    'assurance'=>'tous_risques'],
            ['immat'=>'43789-W-21','email'=>'khadija.hajji@hotmail.com', 'debut'=>'2026-05-22','fin'=>'2026-06-01','coef'=>1.20,'mode'=>'carte',    'assurance'=>'premium'],
            ['immat'=>'25678-D-22','email'=>'rachid.bennani@yahoo.fr',   'debut'=>'2026-05-21','fin'=>'2026-05-31','coef'=>1.20,'mode'=>'virement', 'assurance'=>'tous_risques'],
            ['immat'=>'87321-A-22','email'=>'zineb.lahlou@gmail.com',    'debut'=>'2026-05-23','fin'=>'2026-06-02','coef'=>1.20,'mode'=>'carte',    'assurance'=>'basique'],
            ['immat'=>'54678-W-23','email'=>'karim.fassi@yahoo.fr',      'debut'=>'2026-05-24','fin'=>'2026-06-03','coef'=>1.25,'mode'=>'carte',    'assurance'=>'tous_risques'],
            ['immat'=>'19876-A-23','email'=>'hassan.guerraoui@gmail.com','debut'=>'2026-05-22','fin'=>'2026-06-05','coef'=>1.25,'mode'=>'carte',    'assurance'=>'premium'],
        ];

        foreach ($enCours as $r) {
            $this->creerReservationEnCours($r, $vehId($r['immat']), $cliId($r['email']), $empId(), $lieux);
        }

        // ══════════════════════════════════════════════════════════════════════
        // CONFIRMÉES (contrat brouillon)
        // ══════════════════════════════════════════════════════════════════════
        $confirmees = [
            ['immat'=>'14523-W-23','email'=>'zineb.lahlou@gmail.com',    'debut'=>'2026-06-10','fin'=>'2026-06-15','coef'=>1.30,'mode'=>'carte',   'assurance'=>'premium'],
            ['immat'=>'32198-W-22','email'=>'med.chraibi@gmail.com',     'debut'=>'2026-06-05','fin'=>'2026-06-10','coef'=>1.25,'mode'=>'virement','assurance'=>'basique'],
        ];

        foreach ($confirmees as $r) {
            $this->creerReservationConfirmee($r, $vehId($r['immat']), $cliId($r['email']), $empId(), $lieux);
        }

        // ══════════════════════════════════════════════════════════════════════
        // EN ATTENTE
        // ══════════════════════════════════════════════════════════════════════
        $enAttente = [
            ['immat'=>'54321-W-22','email'=>'sara.elidrissi@gmail.com',  'debut'=>'2026-06-18','fin'=>'2026-06-23','coef'=>1.30,'mode'=>'especes', 'assurance'=>'basique'],
            ['immat'=>'12785-W-23','email'=>'houda.amrani@gmail.com',    'debut'=>'2026-06-20','fin'=>'2026-06-25','coef'=>1.30,'mode'=>'carte',   'assurance'=>'basique'],
        ];

        foreach ($enAttente as $r) {
            $this->creerReservationEnAttente($r, $vehId($r['immat']), $cliId($r['email']), $lieux);
        }

        // ══════════════════════════════════════════════════════════════════════
        // ANNULÉE
        // ══════════════════════════════════════════════════════════════════════
        $debut = '2026-05-01';
        $fin   = '2026-05-06';
        $veh   = Vehicule::find($vehId('43210-A-21'));
        $jours = 5;
        $prixBase  = $veh->tarif_journalier * $jours;
        $prixTotal = round($prixBase * 1.20, 2);

        Reservation::create([
            'numero_reservation'     => $this->nextRes(),
            'client_id'              => $cliId('mehdi.elharti@yahoo.fr'),
            'vehicule_id'            => $vehId('43210-A-21'),
            'employe_id'             => $empId(),
            'date_debut'             => $debut . ' 09:00:00',
            'date_fin'               => $fin . ' 09:00:00',
            'lieu_prise_en_charge'   => $lieux[0],
            'lieu_retour'            => $lieux[0],
            'statut'                 => 'annulee',
            'prix_base'              => $prixBase,
            'prix_total'             => $prixTotal,
            'remise'                 => 0,
            'coefficient_tarification' => 1.20,
            'mode_paiement'          => 'carte',
            'source'                 => 'web',
        ]);
    }

    // ── HELPERS ───────────────────────────────────────────────────────────────

    private function creerReservationComplete(array $r, int $vid, int $cid, int $eid, array $lieux): void
    {
        $veh   = Vehicule::find($vid);
        $jours = (int) (new \DateTime($r['fin']))->diff(new \DateTime($r['debut']))->days ?: 1;
        $prixBase  = $veh->tarif_journalier * $jours;
        $prixTotal = round($prixBase * $r['coef'], 2);

        $reservation = Reservation::create([
            'numero_reservation'     => $this->nextRes(),
            'client_id'              => $cid,
            'vehicule_id'            => $vid,
            'employe_id'             => $eid,
            'date_debut'             => $r['debut'] . ' 09:00:00',
            'date_fin'               => $r['fin']   . ' 09:00:00',
            'lieu_prise_en_charge'   => $lieux[array_rand($lieux)],
            'lieu_retour'            => $lieux[array_rand($lieux)],
            'statut'                 => 'terminee',
            'prix_base'              => $prixBase,
            'prix_total'             => $prixTotal,
            'remise'                 => 0,
            'coefficient_tarification' => $r['coef'],
            'mode_paiement'          => $r['mode'],
            'source'                 => array_rand(['web' => 1, 'agence' => 2, 'telephone' => 3]) ? 'agence' : 'web',
        ]);

        $kmDepart = $veh->kilometrage - ($jours * rand(80, 180));

        $contrat = Contrat::create([
            'numero_contrat'         => $this->nextCtr(),
            'reservation_id'         => $reservation->id,
            'employe_id'             => $eid,
            'date_signature'         => $r['debut'] . ' 09:30:00',
            'etat_depart_vehicule'   => $r['etat_dep'],
            'kilometrage_depart'     => max(0, $kmDepart),
            'niveau_carburant_depart'=> 100,
            'assurance_type'         => $r['assurance'],
            'franchise'              => $r['assurance'] === 'basique' ? 3000 : ($r['assurance'] === 'tous_risques' ? 1500 : 0),
            'signature_client'       => 'Signé electroniquement',
            'signature_employe'      => 'Signé electroniquement',
            'statut'                 => 'termine',
        ]);

        // Acompte 30%
        $acompte = round($prixTotal * 0.30);
        Paiement::create([
            'contrat_id'          => $contrat->id,
            'employe_id'          => $eid,
            'numero_facture'      => $this->nextFac(),
            'montant'             => $acompte,
            'mode'                => $r['mode'],
            'type'                => 'acompte',
            'statut'              => 'valide',
            'reference_transaction' => 'TRX-' . strtoupper(Str::random(8)),
            'date_paiement'       => $r['debut'] . ' 09:30:00',
        ]);

        // Solde 70%
        Paiement::create([
            'contrat_id'          => $contrat->id,
            'employe_id'          => $eid,
            'numero_facture'      => $this->nextFac(),
            'montant'             => $prixTotal - $acompte,
            'mode'                => $r['mode'],
            'type'                => 'solde',
            'statut'              => 'valide',
            'reference_transaction' => 'TRX-' . strtoupper(Str::random(8)),
            'date_paiement'       => $r['fin'] . ' 10:00:00',
        ]);

        // Retour
        $penaliteRetard = isset($r['retard']) && $r['retard'] > 0 ? $r['retard'] * round($veh->tarif_journalier / 24 * 2) : 0;
        $penaliteCarb   = $r['carb_ret'] < 80 ? round((80 - $r['carb_ret']) / 100 * 300) : 0;
        $penaliteDam    = $r['dam'] ? ($r['penalite_dam'] ?? 0) : 0;
        $penaliteTotale = $penaliteRetard + $penaliteCarb + $penaliteDam;

        $retourDate = $r['fin'];
        if (isset($r['retard']) && $r['retard'] > 0) {
            $retourDate = date('Y-m-d', strtotime($r['fin'] . " +{$r['retard']} hours"));
        }

        $depot         = $veh->depot_garantie;
        $depotRetenu   = min($penaliteTotale, $depot);
        $depotLibere   = $depot - $depotRetenu;

        $retour = Retour::create([
            'contrat_id'               => $contrat->id,
            'employe_id'               => $eid,
            'date_retour_effective'    => $retourDate . ' 10:00:00',
            'kilometrage_retour'       => $veh->kilometrage,
            'niveau_carburant_retour'  => $r['carb_ret'],
            'etat_general'             => $r['etat_ret'],
            'dommages_constates'       => $r['dam'],
            'description_dommages'     => $r['dam'] ? ($r['dam_desc'] ?? 'Dommages constatés') : null,
            'penalite_retard'          => $penaliteRetard,
            'penalite_carburant'       => $penaliteCarb,
            'penalite_dommages'        => $penaliteDam,
            'penalite_accessoires'     => 0,
            'penalite_totale'          => $penaliteTotale,
            'depot_libere'             => $depotLibere,
            'depot_retenu'             => $depotRetenu,
        ]);

        // Pénalité payment
        if ($penaliteTotale > 0) {
            Paiement::create([
                'contrat_id'     => $contrat->id,
                'employe_id'     => $eid,
                'numero_facture' => $this->nextFac(),
                'montant'        => $penaliteTotale,
                'mode'           => $r['mode'],
                'type'           => 'penalite',
                'statut'         => 'valide',
                'date_paiement'  => $retourDate . ' 10:30:00',
            ]);
        }
    }

    private function creerReservationEnCours(array $r, int $vid, int $cid, int $eid, array $lieux): void
    {
        $veh   = Vehicule::find($vid);
        $jours = (int) (new \DateTime($r['fin']))->diff(new \DateTime($r['debut']))->days ?: 1;
        $prixBase  = $veh->tarif_journalier * $jours;
        $prixTotal = round($prixBase * $r['coef'], 2);

        $reservation = Reservation::create([
            'numero_reservation'     => $this->nextRes(),
            'client_id'              => $cid,
            'vehicule_id'            => $vid,
            'employe_id'             => $eid,
            'date_debut'             => $r['debut'] . ' 09:00:00',
            'date_fin'               => $r['fin']   . ' 09:00:00',
            'lieu_prise_en_charge'   => $lieux[array_rand($lieux)],
            'lieu_retour'            => $lieux[array_rand($lieux)],
            'statut'                 => 'en_cours',
            'prix_base'              => $prixBase,
            'prix_total'             => $prixTotal,
            'remise'                 => 0,
            'coefficient_tarification' => $r['coef'],
            'mode_paiement'          => $r['mode'],
            'source'                 => 'agence',
        ]);

        $contrat = Contrat::create([
            'numero_contrat'         => $this->nextCtr(),
            'reservation_id'         => $reservation->id,
            'employe_id'             => $eid,
            'date_signature'         => $r['debut'] . ' 09:30:00',
            'etat_depart_vehicule'   => 'excellent',
            'kilometrage_depart'     => $veh->kilometrage,
            'niveau_carburant_depart'=> 100,
            'assurance_type'         => $r['assurance'],
            'franchise'              => $r['assurance'] === 'basique' ? 3000 : ($r['assurance'] === 'tous_risques' ? 1500 : 0),
            'signature_client'       => 'Signé electroniquement',
            'signature_employe'      => 'Signé electroniquement',
            'statut'                 => 'actif',
        ]);

        // Acompte
        Paiement::create([
            'contrat_id'          => $contrat->id,
            'employe_id'          => $eid,
            'numero_facture'      => $this->nextFac(),
            'montant'             => round($prixTotal * 0.30),
            'mode'                => $r['mode'],
            'type'                => 'acompte',
            'statut'              => 'valide',
            'reference_transaction' => 'TRX-' . strtoupper(Str::random(8)),
            'date_paiement'       => $r['debut'] . ' 09:30:00',
        ]);

        // Dépôt de garantie
        Paiement::create([
            'contrat_id'          => $contrat->id,
            'employe_id'          => $eid,
            'numero_facture'      => $this->nextFac(),
            'montant'             => $veh->depot_garantie,
            'mode'                => $r['mode'],
            'type'                => 'depot',
            'statut'              => 'valide',
            'reference_transaction' => 'DEP-' . strtoupper(Str::random(8)),
            'date_paiement'       => $r['debut'] . ' 09:30:00',
        ]);
    }

    private function creerReservationConfirmee(array $r, int $vid, int $cid, int $eid, array $lieux): void
    {
        $veh   = Vehicule::find($vid);
        $jours = (int) (new \DateTime($r['fin']))->diff(new \DateTime($r['debut']))->days ?: 1;
        $prixBase  = $veh->tarif_journalier * $jours;
        $prixTotal = round($prixBase * $r['coef'], 2);

        $reservation = Reservation::create([
            'numero_reservation'     => $this->nextRes(),
            'client_id'              => $cid,
            'vehicule_id'            => $vid,
            'employe_id'             => $eid,
            'date_debut'             => $r['debut'] . ' 09:00:00',
            'date_fin'               => $r['fin']   . ' 09:00:00',
            'lieu_prise_en_charge'   => $lieux[array_rand($lieux)],
            'lieu_retour'            => $lieux[array_rand($lieux)],
            'statut'                 => 'confirmee',
            'prix_base'              => $prixBase,
            'prix_total'             => $prixTotal,
            'remise'                 => 0,
            'coefficient_tarification' => $r['coef'],
            'mode_paiement'          => $r['mode'],
            'source'                 => 'web',
        ]);

        Contrat::create([
            'numero_contrat'         => $this->nextCtr(),
            'reservation_id'         => $reservation->id,
            'employe_id'             => $eid,
            'etat_depart_vehicule'   => 'bon',
            'kilometrage_depart'     => $veh->kilometrage,
            'niveau_carburant_depart'=> 100,
            'assurance_type'         => $r['assurance'],
            'franchise'              => $r['assurance'] === 'basique' ? 3000 : ($r['assurance'] === 'tous_risques' ? 1500 : 0),
            'statut'                 => 'brouillon',
        ]);
    }

    private function creerReservationEnAttente(array $r, int $vid, int $cid, array $lieux): void
    {
        $veh   = Vehicule::find($vid);
        $jours = (int) (new \DateTime($r['fin']))->diff(new \DateTime($r['debut']))->days ?: 1;
        $prixBase  = $veh->tarif_journalier * $jours;
        $prixTotal = round($prixBase * $r['coef'], 2);

        Reservation::create([
            'numero_reservation'   => $this->nextRes(),
            'client_id'            => $cid,
            'vehicule_id'          => $vid,
            'date_debut'           => $r['debut'] . ' 09:00:00',
            'date_fin'             => $r['fin']   . ' 09:00:00',
            'lieu_prise_en_charge' => $lieux[array_rand($lieux)],
            'lieu_retour'          => $lieux[array_rand($lieux)],
            'statut'               => 'en_attente',
            'prix_base'            => $prixBase,
            'prix_total'           => $prixTotal,
            'remise'               => 0,
            'coefficient_tarification' => $r['coef'],
            'mode_paiement'        => $r['mode'],
            'source'               => 'web',
        ]);
    }

    private function nextRes(): string { return sprintf('RES-MA-%04d', ++$this->resSeq); }
    private function nextCtr(): string { return sprintf('CTR-MA-%04d', ++$this->ctrSeq); }
    private function nextFac(): string { return sprintf('FAC-MA-%04d', ++$this->facSeq); }
}
