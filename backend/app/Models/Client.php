<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Client extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'numero_cni',
        'numero_permis',
        'date_naissance',
        'adresse',
        'ville',
        'code_postal',
        'telephone',
        'photo_cni',
        'photo_permis',
        'score_fiabilite',
        'segment',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'date_naissance'   => 'date',
            'score_fiabilite'  => 'integer',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function reservations()
    {
        return $this->hasMany(Reservation::class);
    }

    public function contrats()
    {
        return $this->hasManyThrough(Contrat::class, Reservation::class);
    }

    public function recalculerScore(): void
    {
        $locations = $this->reservations()->whereHas('contrat')->with('contrat.retour')->get();
        $total     = $locations->count();

        if ($total === 0) {
            $this->score_fiabilite = 50;
            $this->save();
            return;
        }

        $score = 50;

        // Fidélité (+15 max)
        $score += min(15, $total * 2);

        // Paiements à temps (+20 max)
        $paiementsEnRetard = $this->reservations()
            ->whereHas('contrat.paiements', fn ($q) => $q->where('statut', 'en_retard'))
            ->count();
        $score += max(0, 20 - $paiementsEnRetard * 5);

        // Retards de retour (-5 par retard)
        $retards = $this->reservations()
            ->whereHas('contrat.retour', fn ($q) => $q->whereColumn('date_retour_effective', '>', 'date_retour_prevue'))
            ->count();
        $score -= $retards * 5;

        // Annulations tardives (-3 par annulation)
        $annulations = $this->reservations()->where('statut', 'annulee')->count();
        $score -= $annulations * 3;

        // Dommages signalés (-10 par incident)
        $dommages = $this->reservations()
            ->whereHas('contrat.retour', fn ($q) => $q->where('dommages_constates', true))
            ->count();
        $score -= $dommages * 10;

        $this->score_fiabilite = max(0, min(100, $score));
        $this->segment         = $this->determinerSegment($this->score_fiabilite);
        $this->save();
    }

    private function determinerSegment(int $score): string
    {
        if ($score >= 80) return 'vip';
        if ($score >= 50) return 'standard';
        return 'risque';
    }
}
