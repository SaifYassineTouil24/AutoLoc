<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Paiement extends Model
{
    use HasFactory;

    protected $fillable = [
        'contrat_id',
        'employe_id',
        'numero_facture',
        'montant',
        'mode',
        'type',
        'statut',
        'reference_transaction',
        'date_paiement',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'montant'        => 'decimal:2',
            'date_paiement'  => 'datetime',
        ];
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($paiement) {
            if (empty($paiement->numero_facture)) {
                $paiement->numero_facture = 'FAC-' . date('Y') . '-' . str_pad(
                    static::whereYear('created_at', date('Y'))->count() + 1,
                    5, '0', STR_PAD_LEFT
                );
            }
        });
    }

    public function contrat()
    {
        return $this->belongsTo(Contrat::class);
    }

    public function employe()
    {
        return $this->belongsTo(User::class, 'employe_id');
    }
}
