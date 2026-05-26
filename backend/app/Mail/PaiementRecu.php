<?php

namespace App\Mail;

use App\Models\Paiement;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class PaiementRecu extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public Paiement $paiement) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: 'Paiement reçu — ' . number_format($this->paiement->montant, 2) . ' MAD');
    }

    public function content(): Content
    {
        return new Content(view: 'emails.paiement_recu');
    }
}
