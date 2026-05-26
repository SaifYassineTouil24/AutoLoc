@extends('emails.layout')

@section('content')
@php $r = $reservation; $v = $r->vehicule; $u = $r->client->user; @endphp
<p class="title">Réservation confirmée ✓</p>
<p class="subtitle">Bonjour {{ $u->prenom }} {{ $u->name }}, votre réservation a été confirmée.</p>

<div class="card">
  <div class="row"><span class="label">N° réservation</span><span class="value">{{ $r->numero_reservation }}</span></div>
  <div class="row"><span class="label">Véhicule</span><span class="value">{{ $v->marque }} {{ $v->modele }}</span></div>
  <div class="row"><span class="label">Immatriculation</span><span class="value">{{ $v->immatriculation }}</span></div>
  <div class="row"><span class="label">Début</span><span class="value">{{ $r->date_debut->format('d/m/Y') }}</span></div>
  <div class="row"><span class="label">Fin</span><span class="value">{{ $r->date_fin->format('d/m/Y') }}</span></div>
  <div class="row"><span class="label">Durée</span><span class="value">{{ $r->dureeJours() }} jour(s)</span></div>
  <div class="row"><span class="label">Lieu de prise en charge</span><span class="value">{{ $r->lieu_prise_en_charge ?? 'Agence principale' }}</span></div>
</div>

<div class="total">
  <span class="tlabel">Montant total</span>
  <span class="tvalue">{{ number_format($r->prix_total, 2) }} MAD</span>
</div>

<p style="font-size:13px;color:#4a5568;">
  Veuillez vous présenter à l'agence muni de votre CIN et permis de conduire.
  Pour toute question, contactez-nous au <strong>+212 5 22 00 00 00</strong>.
</p>
@endsection
