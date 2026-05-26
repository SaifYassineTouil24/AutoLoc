<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Reservation extends Model
{
    use HasFactory;

    protected $fillable = [
        'numero_reservation',
        'client_id',
        'vehicule_id',
        'employe_id',
        'date_debut',
        'date_fin',
        'lieu_prise_en_charge',
        'lieu_retour',
        'statut',
        'prix_base',
        'prix_total',
        'remise',
        'coefficient_tarification',
        'mode_paiement',
        'notes',
        'source',
    ];

    protected function casts(): array
    {
        return [
            'date_debut'              => 'datetime',
            'date_fin'                => 'datetime',
            'prix_base'               => 'decimal:2',
            'prix_total'              => 'decimal:2',
            'remise'                  => 'decimal:2',
            'coefficient_tarification' => 'decimal:4',
        ];
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($reservation) {
            if (empty($reservation->numero_reservation)) {
                $reservation->numero_reservation = 'RES-' . strtoupper(uniqid());
            }
        });
    }

    public function client()
    {
        return $this->belongsTo(Client::class);
    }

    public function vehicule()
    {
        return $this->belongsTo(Vehicule::class);
    }

    public function employe()
    {
        return $this->belongsTo(User::class, 'employe_id');
    }

    public function contrat()
    {
        return $this->hasOne(Contrat::class);
    }

    public function dureeJours(): int
    {
        return (int) $this->date_debut->diffInDays($this->date_fin) ?: 1;
    }

    public function calculerPrixTotal(float $coefficient = 1.0): float
    {
        $tarif = $this->vehicule->tarif_journalier * $coefficient;
        $sousTotal = $tarif * $this->dureeJours();
        return round($sousTotal - ($this->remise ?? 0), 2);
    }
}
