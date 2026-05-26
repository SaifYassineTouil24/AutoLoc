@extends('emails.layout')

@section('content')
@php $c = $contrat; $r = $c->reservation; $v = $r->vehicule; $u = $r->client->user; @endphp
<p class="title">Contrat signé ✓</p>
<p class="subtitle">Bonjour {{ $u->prenom }} {{ $u->name }}, votre contrat de location est maintenant actif.</p>

<div class="card">
  <div class="row"><span class="label">N° contrat</span><span class="value">{{ $c->numero_contrat }}</span></div>
  <div class="row"><span class="label">Véhicule</span><span class="value">{{ $v->marque }} {{ $v->modele }} ({{ $v->immatriculation }})</span></div>
  <div class="row"><span class="label">Date signature</span><span class="value">{{ $c->date_signature?->format('d/m/Y à H:i') }}</span></div>
  <div class="row"><span class="label">Début</span><span class="value">{{ $r->date_debut->format('d/m/Y') }}</span></div>
  <div class="row"><span class="label">Fin prévue</span><span class="value">{{ $r->date_fin->format('d/m/Y') }}</span></div>
  <div class="row"><span class="label">Assurance</span><span class="value">{{ ucfirst(str_replace('_',' ',$c->assurance_type ?? 'basique')) }}</span></div>
  <div class="row"><span class="label">Kilométrage départ</span><span class="value">{{ number_format($c->kilometrage_depart) }} km</span></div>
</div>

<div class="total">
  <span class="tlabel">Montant total</span>
  <span class="tvalue">{{ number_format($r->prix_total, 2) }} MAD</span>
</div>

<p style="font-size:13px;color:#4a5568;">
  Bon voyage ! Merci de respecter les conditions du contrat. Pour toute urgence : <strong>+212 5 22 00 00 00</strong>.
</p>
@endsection
