@extends('emails.layout')

@section('content')
@php $r = $reservation; $v = $r->vehicule; $u = $r->client->user; @endphp
<p class="title">Rappel : retour prévu demain</p>
<p class="subtitle">Bonjour {{ $u->prenom }} {{ $u->name }}, votre location se termine demain.</p>

<div class="card">
  <div class="row"><span class="label">N° réservation</span><span class="value">{{ $r->numero_reservation }}</span></div>
  <div class="row"><span class="label">Véhicule</span><span class="value">{{ $v->marque }} {{ $v->modele }} ({{ $v->immatriculation }})</span></div>
  <div class="row"><span class="label">Date de retour prévue</span><span class="value" style="color:#c53030;font-weight:bold;">{{ $r->date_fin->format('d/m/Y') }}</span></div>
  <div class="row"><span class="label">Lieu de retour</span><span class="value">{{ $r->lieu_retour ?? 'Agence principale' }}</span></div>
</div>

<p style="font-size:13px;color:#4a5568;">
  ⚠️ Tout retour après la date prévue entraîne des <strong>pénalités de retard</strong> calculées au prorata horaire.<br><br>
  Pour prolonger votre location, contactez-nous avant la date de retour au <strong>+212 5 22 00 00 00</strong>.
</p>
@endsection
