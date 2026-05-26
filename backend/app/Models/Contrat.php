<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Contrat extends Model
{
    use HasFactory;

    protected $fillable = [
        'numero_contrat',
        'reservation_id',
        'employe_id',
        'date_signature',
        'etat_depart_vehicule',
        'kilometrage_depart',
        'niveau_carburant_depart',
        'photos_depart',
        'accessoires',
        'conditions_particulieres',
        'franchise',
        'assurance_type',
        'signature_client',
        'signature_employe',
        'pdf_path',
        'statut',
    ];

    protected function casts(): array
    {
        return [
            'date_signature'       => 'datetime',
            'photos_depart'        => 'array',
            'accessoires'          => 'array',
            'franchise'            => 'decimal:2',
        ];
    }

    protected static function boot()
    {
        parent::boot();;

        static::creating(function ($contrat) {
            if (empty($contrat->numero_contrat)) {
                $contrat->numero_contrat = 'CTR-' . date('Y') . '-' . strtoupper(uniqid());
            }
        });
    }

    public function reservation()
    {
        return $this->belongsTo(Reservation::class);
    }

    public function employe()
    {
        return $this->belongsTo(User::class, 'employe_id');
    }

    public function paiements()
    {
        return $this->hasMany(Paiement::class);
    }

    public function retour()
    {
        return $this->hasOne(Retour::class);
    }

    public function montantPaye(): float
    {
        return (float) $this->paiements()->where('statut', 'valide')->sum('montant');
    }

    public function soldeDu(): float
    {
        return max(0, $this->reservation->prix_total - $this->montantPaye());
    }
}
