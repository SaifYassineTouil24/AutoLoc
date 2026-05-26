<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: DejaVu Sans, sans-serif; font-size: 11px; color: #1a1a2e; background: #fff; }

  .header { background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); color: #fff; padding: 20px 30px; display: flex; justify-content: space-between; align-items: center; }
  .header .logo-text { font-size: 22px; font-weight: bold; letter-spacing: 2px; }
  .header .logo-sub { font-size: 10px; color: #a0aec0; margin-top: 2px; }
  .header .numero { text-align: right; }
  .header .numero .num { font-size: 16px; font-weight: bold; color: #f6ad55; }
  .header .numero .date-label { font-size: 9px; color: #a0aec0; margin-top: 4px; }

  .badge-statut { display: inline-block; padding: 4px 14px; border-radius: 20px; font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; }
  .badge-signe { background: #c6f6d5; color: #276749; }
  .badge-brouillon { background: #fef3c7; color: #92400e; }
  .badge-resilie { background: #fed7d7; color: #c53030; }

  .section { margin: 18px 30px; }
  .section-title { font-size: 12px; font-weight: bold; color: #2d3748; border-bottom: 2px solid #e2e8f0; padding-bottom: 5px; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px; }

  .grid-2 { display: table; width: 100%; }
  .grid-2 .col { display: table-cell; width: 50%; vertical-align: top; padding-right: 15px; }
  .grid-2 .col:last-child { padding-right: 0; padding-left: 15px; }

  .info-box { background: #f7fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 14px; }
  .info-box .label { font-size: 9px; color: #718096; text-transform: uppercase; letter-spacing: 0.5px; }
  .info-box .value { font-size: 12px; font-weight: bold; color: #2d3748; margin-top: 2px; }
  .info-box .sub { font-size: 10px; color: #4a5568; margin-top: 1px; }

  table.details { width: 100%; border-collapse: collapse; }
  table.details th { background: #edf2f7; color: #4a5568; font-size: 9px; text-transform: uppercase; letter-spacing: 0.5px; padding: 8px 10px; text-align: left; border: 1px solid #e2e8f0; }
  table.details td { padding: 8px 10px; border: 1px solid #e2e8f0; font-size: 10px; vertical-align: top; }
  table.details tr:nth-child(even) td { background: #f7fafc; }

  .total-box { background: #1a1a2e; color: #fff; border-radius: 8px; padding: 16px 22px; margin: 18px 30px; }
  .total-box .row { display: table; width: 100%; margin-bottom: 6px; }
  .total-box .row .left { display: table-cell; font-size: 11px; color: #a0aec0; }
  .total-box .row .right { display: table-cell; text-align: right; font-size: 11px; color: #fff; }
  .total-box .row.grand { border-top: 1px solid #4a5568; padding-top: 8px; margin-top: 4px; }
  .total-box .row.grand .left { font-size: 13px; color: #f6ad55; font-weight: bold; }
  .total-box .row.grand .right { font-size: 16px; color: #f6ad55; font-weight: bold; }

  .signature-zone { margin: 18px 30px; display: table; width: calc(100% - 60px); }
  .sig-box { display: table-cell; width: 50%; text-align: center; padding: 10px; }
  .sig-line { border-top: 1px solid #cbd5e0; margin: 30px 20px 5px; }
  .sig-label { font-size: 9px; color: #718096; }

  .conditions { margin: 0 30px 18px; background: #fffaf0; border: 1px solid #fbd38d; border-radius: 6px; padding: 12px; font-size: 9px; color: #744210; }

  .footer { border-top: 1px solid #e2e8f0; text-align: center; padding: 10px 30px; font-size: 9px; color: #718096; margin-top: 10px; }
  .footer strong { color: #f6ad55; }

  .tag { display: inline-block; background: #ebf8ff; color: #2b6cb0; font-size: 9px; padding: 2px 8px; border-radius: 10px; margin: 2px; }
  .tag.rouge { background: #fff5f5; color: #c53030; }
  .tag.vert { background: #f0fff4; color: #276749; }
</style>
</head>
<body>

<!-- HEADER -->
<div class="header">
  <div>
    <div class="logo-text">AutoLoc</div>
    <div class="logo-sub">Gestion Location Automobile · Maroc</div>
  </div>
  <div style="text-align:center;">
    <div class="badge-statut badge-{{ $contrat->statut === 'signe' ? 'signe' : ($contrat->statut === 'resilie' ? 'resilie' : 'brouillon') }}">
      {{ strtoupper($contrat->statut) }}
    </div>
  </div>
  <div class="numero">
    <div style="font-size:10px;color:#a0aec0;">CONTRAT DE LOCATION</div>
    <div class="num">{{ $contrat->numero_contrat }}</div>
    <div class="date-label">
      @if($contrat->date_signature)
        Signé le {{ $contrat->date_signature->format('d/m/Y à H:i') }}
      @else
        Brouillon — non signé
      @endif
    </div>
  </div>
</div>

<!-- PARTIES -->
<div class="section">
  <div class="section-title">Parties au contrat</div>
  <div class="grid-2">
    <div class="col">
      <div class="info-box">
        <div class="label">Le Loueur</div>
        <div class="value">AutoLoc Gestion</div>
        <div class="sub">Société de location de véhicules</div>
        <div class="sub" style="margin-top:6px;">123 Boulevard Mohammed V</div>
        <div class="sub">Casablanca 20000 — Maroc</div>
        <div class="sub">Tél : +212 5 22 00 00 00</div>
        @if($contrat->employe)
          <div class="sub" style="margin-top:6px;font-weight:bold;">Agent : {{ $contrat->employe->prenom }} {{ $contrat->employe->name }}</div>
        @endif
      </div>
    </div>
    <div class="col">
      @php $client = $contrat->reservation->client; $user = $client->user; @endphp
      <div class="info-box">
        <div class="label">Le Locataire</div>
        <div class="value">{{ $user->prenom }} {{ $user->name }}</div>
        <div class="sub">{{ $user->email }}</div>
        <div class="sub" style="margin-top:4px;">CIN : {{ $client->numero_cni }}</div>
        <div class="sub">Permis : {{ $client->numero_permis }}</div>
        <div class="sub">Tél : {{ $client->telephone }}</div>
        <div class="sub">{{ $client->adresse }}, {{ $client->ville }}</div>
      </div>
    </div>
  </div>
</div>

<!-- VEHICULE -->
<div class="section">
  <div class="section-title">Véhicule loué</div>
  @php $vehicule = $contrat->reservation->vehicule; @endphp
  <div class="grid-2">
    <div class="col">
      <div class="info-box">
        <div class="label">Identification</div>
        <div class="value">{{ $vehicule->marque }} {{ $vehicule->modele }}</div>
        <div class="sub">Immatriculation : <strong>{{ $vehicule->immatriculation }}</strong></div>
        <div class="sub">Catégorie : {{ ucfirst($vehicule->categorie) }}</div>
        <div class="sub">Couleur : {{ $vehicule->couleur ?? 'N/A' }}</div>
        <div class="sub">Énergie : {{ $vehicule->energie ?? 'N/A' }}</div>
      </div>
    </div>
    <div class="col">
      <div class="info-box">
        <div class="label">État au départ</div>
        <div class="value">{{ ucfirst($contrat->etat_depart_vehicule) }}</div>
        <div class="sub">Kilométrage départ : {{ number_format($contrat->kilometrage_depart) }} km</div>
        <div class="sub">Carburant départ : {{ $contrat->niveau_carburant_depart }}%</div>
        <div class="sub">Assurance : {{ $contrat->assurance_type ? ucfirst(str_replace('_', ' ', $contrat->assurance_type)) : 'Basique' }}</div>
        <div class="sub">Franchise : {{ $contrat->franchise ? number_format($contrat->franchise, 2) . ' MAD' : 'Aucune' }}</div>
      </div>
    </div>
  </div>
</div>

<!-- PERIODE ET LIEUX -->
<div class="section">
  <div class="section-title">Période de location</div>
  <table class="details">
    <thead>
      <tr>
        <th>Date de début</th>
        <th>Date de fin</th>
        <th>Durée</th>
        <th>Lieu de prise en charge</th>
        <th>Lieu de retour</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>{{ $contrat->reservation->date_debut->format('d/m/Y') }}</strong><br>{{ $contrat->reservation->date_debut->format('H:i') }}</td>
        <td><strong>{{ $contrat->reservation->date_fin->format('d/m/Y') }}</strong><br>{{ $contrat->reservation->date_fin->format('H:i') }}</td>
        <td><strong>{{ $contrat->reservation->dureeJours() }} jour(s)</strong></td>
        <td>{{ $contrat->reservation->lieu_prise_en_charge ?? 'Agence principale' }}</td>
        <td>{{ $contrat->reservation->lieu_retour ?? 'Agence principale' }}</td>
      </tr>
    </tbody>
  </table>
</div>

@if($contrat->accessoires && count($contrat->accessoires) > 0)
<!-- ACCESSOIRES -->
<div class="section">
  <div class="section-title">Accessoires inclus</div>
  <div>
    @foreach($contrat->accessoires as $acc)
      <span class="tag vert">{{ $acc }}</span>
    @endforeach
  </div>
</div>
@endif

<!-- TOTAL -->
<div class="total-box">
  @php $res = $contrat->reservation; @endphp
  <div class="row">
    <div class="left">Tarif journalier</div>
    <div class="right">{{ number_format($vehicule->tarif_journalier, 2) }} MAD</div>
  </div>
  <div class="row">
    <div class="left">Durée</div>
    <div class="right">× {{ $res->dureeJours() }} jours</div>
  </div>
  @if($res->remise > 0)
  <div class="row">
    <div class="left">Remise</div>
    <div class="right">− {{ number_format($res->remise, 2) }} MAD</div>
  </div>
  @endif
  @if($res->coefficient_tarification && $res->coefficient_tarification != 1)
  <div class="row">
    <div class="left">Coefficient tarification IA</div>
    <div class="right">× {{ $res->coefficient_tarification }}</div>
  </div>
  @endif
  @php $montantPaye = $contrat->montantPaye(); $soldeDu = $contrat->soldeDu(); @endphp
  <div class="row">
    <div class="left">Montant payé</div>
    <div class="right">{{ number_format($montantPaye, 2) }} MAD</div>
  </div>
  <div class="row grand">
    <div class="left">TOTAL À PAYER</div>
    <div class="right">{{ number_format($res->prix_total, 2) }} MAD</div>
  </div>
  @if($soldeDu > 0)
  <div class="row" style="margin-top:4px;">
    <div class="left" style="color:#fc8181;">Solde restant dû</div>
    <div class="right" style="color:#fc8181;">{{ number_format($soldeDu, 2) }} MAD</div>
  </div>
  @endif
</div>

@if($contrat->conditions_particulieres)
<!-- CONDITIONS PARTICULIERES -->
<div class="conditions">
  <strong>Conditions particulières :</strong> {{ $contrat->conditions_particulieres }}
</div>
@endif

<!-- SIGNATURES -->
@if($contrat->statut === 'signe')
<div class="section">
  <div class="section-title">Signatures</div>
  <div class="signature-zone">
    <div class="sig-box">
      <div style="font-size:9px;color:#718096;margin-bottom:5px;">Signature du locataire</div>
      <div style="font-size:8px;color:#a0aec0;margin-bottom:20px;">(Lu et approuvé)</div>
      @if($contrat->signature_client)
        <div style="font-size:10px;font-style:italic;color:#4a5568;padding:10px;border:1px solid #e2e8f0;border-radius:4px;min-height:30px;">✓ Signé électroniquement</div>
      @endif
      <div class="sig-line"></div>
      <div class="sig-label">{{ $user->prenom }} {{ $user->name }}</div>
    </div>
    <div class="sig-box">
      <div style="font-size:9px;color:#718096;margin-bottom:5px;">Signature de l'agent</div>
      <div style="font-size:8px;color:#a0aec0;margin-bottom:20px;">(Pour AutoLoc Gestion)</div>
      @if($contrat->signature_employe)
        <div style="font-size:10px;font-style:italic;color:#4a5568;padding:10px;border:1px solid #e2e8f0;border-radius:4px;min-height:30px;">✓ Signé électroniquement</div>
      @endif
      <div class="sig-line"></div>
      <div class="sig-label">{{ $contrat->employe?->prenom }} {{ $contrat->employe?->name }}</div>
    </div>
  </div>
</div>
@endif

<!-- FOOTER -->
<div class="footer">
  <strong>AutoLoc Gestion</strong> · Société de location de véhicules · Casablanca, Maroc · Tel : +212 5 22 00 00 00<br>
  Document généré le {{ now()->format('d/m/Y à H:i') }} · Réservation {{ $contrat->reservation->numero_reservation }}
</div>

</body>
</html>
