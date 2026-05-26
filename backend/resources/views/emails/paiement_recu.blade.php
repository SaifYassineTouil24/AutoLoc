@extends('emails.layout')

@section('content')
@php $p = $paiement; $c = $p->contrat; $r = $c->reservation; $u = $r->client->user; @endphp
<p class="title">Paiement reçu ✓</p>
<p class="subtitle">Bonjour {{ $u->prenom }} {{ $u->name }}, nous avons bien reçu votre paiement.</p>

<div class="card">
  <div class="row"><span class="label">Contrat</span><span class="value">{{ $c->numero_contrat }}</span></div>
  <div class="row"><span class="label">Type</span><span class="value">{{ ucfirst($p->type) }}</span></div>
  <div class="row"><span class="label">Mode</span><span class="value">{{ ucfirst($p->mode) }}</span></div>
  <div class="row"><span class="label">Date</span><span class="value">{{ $p->date_paiement?->format('d/m/Y') }}</span></div>
  @if($p->reference_transaction)
  <div class="row"><span class="label">Référence</span><span class="value">{{ $p->reference_transaction }}</span></div>
  @endif
</div>

<div class="total">
  <span class="tlabel">Montant encaissé</span>
  <span class="tvalue">{{ number_format($p->montant, 2) }} MAD</span>
</div>

@php $solde = $c->soldeDu(); @endphp
@if($solde > 0)
<p style="font-size:13px;color:#c53030;font-weight:bold;">
  Solde restant dû : {{ number_format($solde, 2) }} MAD
</p>
@else
<p style="font-size:13px;color:#276749;font-weight:bold;">
  ✓ Votre contrat est entièrement soldé.
</p>
@endif
@endsection
