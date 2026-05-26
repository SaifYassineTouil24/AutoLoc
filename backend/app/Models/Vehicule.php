<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Vehicule extends Model
{
    use HasFactory;

    protected $fillable = [
        'immatriculation',
        'marque',
        'modele',
        'annee',
        'couleur',
        'categorie',
        'kilometrage',
        'statut',
        'tarif_journalier',
        'depot_garantie',
        'niveau_carburant',
        'nombre_places',
        'boite_vitesse',
        'photo_principale',
        'photos',
        'description',
        // Documents
        'date_carte_grise',
        'date_assurance',
        'date_controle_technique',
        // Vidange
        'derniere_vidange_date',
        'derniere_vidange_km',
        'prochaine_vidange_km',
        'prochaine_vidange_date',
        // Vignette
        'vignette_annee',
        'vignette_payee',
        'vignette_date_paiement',
        'vignette_justificatif',
        // Visite technique
        'derniere_visite_technique_date',
        'prochaine_visite_technique_date',
        'visite_technique_justificatif',
    ];

    protected function casts(): array
    {
        return [
            'photos'                        => 'array',
            'tarif_journalier'              => 'decimal:2',
            'depot_garantie'                => 'decimal:2',
            'vignette_payee'                => 'boolean',
            'derniere_vidange_date'         => 'date',
            'prochaine_vidange_date'        => 'date',
            'vignette_date_paiement'        => 'date',
            'derniere_visite_technique_date' => 'date',
            'prochaine_visite_technique_date' => 'date',
            'date_assurance'                => 'date',
            'date_controle_technique'       => 'date',
        ];
    }

    public function reservations()
    {
        return $this->hasMany(Reservation::class);
    }

    public function maintenances()
    {
        return $this->hasMany(Maintenance::class);
    }

    public function estDisponible(\Carbon\Carbon $debut, \Carbon\Carbon $fin): bool
    {
        if (!in_array($this->statut, ['disponible'])) {
            return false;
        }

        return !$this->reservations()
            ->whereIn('statut', ['confirmee', 'en_cours'])
            ->where('date_debut', '<', $fin)
            ->where('date_fin', '>', $debut)
            ->exists();
    }

    public function statutObligations(): array
    {
        $now = now();

        return [
            'vidange' => $this->statutVidange($now),
            'visite_technique' => $this->statutVisiteTechnique($now),
            'vignette' => $this->statutVignette($now),
        ];
    }

    private function statutVidange(\Carbon\Carbon $now): string
    {
        if (!$this->prochaine_vidange_km && !$this->prochaine_vidange_date) return 'non_renseigne';

        $kmRestants = $this->prochaine_vidange_km ? ($this->prochaine_vidange_km - $this->kilometrage) : null;
        $joursRestants = $this->prochaine_vidange_date ? $now->diffInDays($this->prochaine_vidange_date, false) : null;

        if (($kmRestants !== null && $kmRestants < -1500) || ($joursRestants !== null && $joursRestants < 0)) {
            return 'en_retard';
        }
        if (($kmRestants !== null && $kmRestants <= 1000) || ($joursRestants !== null && $joursRestants <= 30)) {
            return 'a_prevoir';
        }
        return 'a_jour';
    }

    private function statutVisiteTechnique(\Carbon\Carbon $now): string
    {
        if (!$this->prochaine_visite_technique_date) return 'non_renseigne';

        $jours = $now->diffInDays($this->prochaine_visite_technique_date, false);
        if ($jours < 0) return 'en_retard';
        if ($jours <= 60) return 'a_prevoir';
        return 'a_jour';
    }

    private function statutVignette(\Carbon\Carbon $now): string
    {
        $anneeEnCours = $now->year;
        $echeance = \Carbon\Carbon::create($anneeEnCours, 1, 31);
        if ($now->gt($echeance)) {
            $echeance = \Carbon\Carbon::create($anneeEnCours + 1, 1, 31);
        }

        if ($this->vignette_payee && $this->vignette_annee >= $anneeEnCours) {
            return 'a_jour';
        }

        $jours = $now->diffInDays($echeance, false);
        if ($jours <= 30) return 'a_prevoir';
        return 'a_jour';
    }
}
