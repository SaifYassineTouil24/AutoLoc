<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Reclamation extends Model
{
    protected $fillable = [
        'client_id', 'reservation_id', 'agent_id',
        'type', 'priorite', 'titre', 'description',
        'statut', 'reponse', 'closed_at',
    ];

    protected function casts(): array
    {
        return ['closed_at' => 'datetime'];
    }

    public function client()      { return $this->belongsTo(Client::class); }
    public function reservation() { return $this->belongsTo(Reservation::class); }
    public function agent()       { return $this->belongsTo(User::class, 'agent_id'); }
}
