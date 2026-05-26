<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Retour extends Model
{
    use HasFactory;

    protected $fillable = [
        'contrat_id',
        'employe_id',
        'date_retour_effective',
        'kilometrage_retour',
        'niveau_carburant_retour',
        'etat_general',
        'dommages_constates',
        'description_dommages',
        'photos_retour',
        'accessoires_manquants',
        'penalite_retard',
        'penalite_carburant',
        'penalite_dommages',
        'penalite_accessoires',
        'penalite_totale',
        'depot_libere',
        'depot_retenu',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'date_retour_effective'  => 'datetime',
            'dommages_constates'     => 'boolean',
            'photos_retour'          => 'array',
            'accessoires_manquants'  => 'array',
            'penalite_retard'        => 'decimal:2',
            'penalite_carburant'     => 'decimal:2',
            'penalite_dommages'      => 'decimal:2',
            'penalite_accessoires'   => 'decimal:2',
            'penalite_totale'        => 'decimal:2',
            'depot_libere'           => 'decimal:2',
            'depot_retenu'           => 'decimal:2',
        ];
    }

    public function contrat()
    {
        return $this->belongsTo(Contrat::class);
    }

    public function employe()
    {
        return $this->belongsTo(User::class, 'employe_id');
    }

    public function calculerPenalites(): void
    {
        $contrat     = $this->contrat;
        $reservation = $contrat->reservation;

        // Retard
        $heuresRetard = max(0, $reservation->date_fin->diffInHours($this->date_retour_effective, false));
        $tarifHoraire = $reservation->vehicule->tarif_journalier / 24;
        $this->penalite_retard = round($heuresRetard > 0 ? $heuresRetard * $tarifHoraire : 0, 2);

        // Carburant manquant (estimation 50 DZD/litre, 50L de différence max)
        $diffCarburant = $contrat->niveau_carburant_depart - $this->niveau_carburant_retour;
        $this->penalite_carburant = $diffCarburant > 0 ? round($diffCarburant * 50, 2) : 0;

        // Dommages — calculé manuellement par l'employé, on garde la valeur saisie

        $this->penalite_totale = $this->penalite_retard
            + $this->penalite_carburant
            + ($this->penalite_dommages ?? 0)
            + ($this->penalite_accessoires ?? 0);

        $depot = $reservation->vehicule->depot_garantie;
        $this->depot_retenu  = min($depot, $this->penalite_totale);
        $this->depot_libere  = max(0, $depot - $this->penalite_totale);
    }
}
