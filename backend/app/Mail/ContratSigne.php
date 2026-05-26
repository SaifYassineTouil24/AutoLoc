<?php

namespace App\Mail;

use App\Models\Contrat;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ContratSigne extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public Contrat $contrat) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: 'Contrat signé — ' . $this->contrat->numero_contrat);
    }

    public function content(): Content
    {
        return new Content(view: 'emails.contrat_signe');
    }
}
