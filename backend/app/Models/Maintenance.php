<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Maintenance extends Model
{
    use HasFactory;

    protected $fillable = [
        'vehicule_id',
        'type',
        'sous_type',
        'description',
        'date_prevue',
        'date_effective',
        'kilometrage_reference',
        'kilometrage_effectif',
        'prestataire',
        'cout',
        'duree_immobilisation_jours',
        'statut',
        'justificatif',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'date_prevue'     => 'date',
            'date_effective'  => 'date',
            'cout'            => 'decimal:2',
        ];
    }

    public function vehicule()
    {
        return $this->belongsTo(Vehicule::class);
    }
}
