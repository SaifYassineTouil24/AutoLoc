<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: DejaVu Sans, sans-serif; font-size: 11px; color: #1a1a2e; background: #fff; }

  .header { background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); color: #fff; padding: 20px 30px; }
  .header .title { font-size: 18px; font-weight: bold; letter-spacing: 1px; }
  .header .subtitle { font-size: 11px; color: #a0aec0; margin-top: 4px; }
  .header .meta { float: right; text-align: right; font-size: 10px; color: #a0aec0; }
  .header .meta .period { font-size: 16px; font-weight: bold; color: #f6ad55; }

  .kpi-row { display: table; width: 100%; padding: 0; margin: 0; }
  .kpi-cell { display: table-cell; width: 25%; padding: 16px 10px; text-align: center; border-right: 1px solid #e2e8f0; }
  .kpi-cell:last-child { border-right: none; }
  .kpi-value { font-size: 22px; font-weight: bold; color: #1a1a2e; }
  .kpi-label { font-size: 9px; color: #718096; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 4px; }
  .kpi-cell.accent .kpi-value { color: #2b6cb0; }
  .kpi-cell.green .kpi-value { color: #276749; }
  .kpi-cell.orange .kpi-value { color: #c05621; }

  .section { margin: 18px 30px; }
  .section-title { font-size: 12px; font-weight: bold; color: #2d3748; border-bottom: 2px solid #e2e8f0; padding-bottom: 5px; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px; }

  table.data { width: 100%; border-collapse: collapse; }
  table.data th { background: #edf2f7; color: #4a5568; font-size: 9px; text-transform: uppercase; letter-spacing: 0.5px; padding: 8px 10px; text-align: left; border: 1px solid #e2e8f0; }
  table.data td { padding: 8px 10px; border: 1px solid #e2e8f0; font-size: 10px; }
  table.data tr:nth-child(even) td { background: #f7fafc; }
  table.data td.num { text-align: right; font-weight: bold; }
  table.data td.center { text-align: center; }

  .bar-chart { margin-top: 8px; }
  .bar-row { margin-bottom: 6px; display: table; width: 100%; }
  .bar-label { display: table-cell; width: 80px; font-size: 9px; color: #4a5568; vertical-align: middle; }
  .bar-track { display: table-cell; vertical-align: middle; }
  .bar-fill { height: 14px; background: linear-gradient(90deg, #2b6cb0, #4299e1); border-radius: 3px; display: inline-block; min-width: 4px; }
  .bar-val { display: table-cell; width: 80px; font-size: 9px; font-weight: bold; color: #2d3748; text-align: right; vertical-align: middle; }

  .stat-grid { display: table; width: 100%; border: 1px solid #e2e8f0; border-radius: 6px; overflow: hidden; }
  .stat-cell { display: table-cell; padding: 12px 16px; border-right: 1px solid #e2e8f0; }
  .stat-cell:last-child { border-right: none; }
  .stat-cell .s-label { font-size: 9px; color: #718096; text-transform: uppercase; }
  .stat-cell .s-val { font-size: 15px; font-weight: bold; margin-top: 3px; }
  .s-val.terminee { color: #276749; }
  .s-val.en_cours { color: #2b6cb0; }
  .s-val.confirmee { color: #6b46c1; }
  .s-val.annulee { color: #c53030; }
  .s-val.en_attente { color: #c05621; }

  .footer { border-top: 1px solid #e2e8f0; text-align: center; padding: 10px 30px; font-size: 9px; color: #718096; margin-top: 16px; }
  .footer strong { color: #f6ad55; }

  .badge { display: inline-block; padding: 2px 8px; border-radius: 10px; font-size: 9px; font-weight: bold; }
  .badge-eco { background: #c6f6d5; color: #276749; }
  .badge-comp { background: #bee3f8; color: #2c5282; }
  .badge-berline { background: #e9d8fd; color: #553c9a; }
  .badge-suv { background: #fefcbf; color: #744210; }
  .badge-luxe { background: #fed7d7; color: #c53030; }
  .badge-utilitaire { background: #e2e8f0; color: #4a5568; }

  .rank-medal { font-size: 14px; }
</style>
</head>
<body>

<!-- HEADER -->
<div class="header">
  <div class="meta">
    <div>Généré le {{ $generated_at }}</div>
    <div class="period">{{ ucfirst($label_mois) }}</div>
  </div>
  <div style="overflow:hidden;">
    <div class="title">RAPPORT MENSUEL D'ACTIVITÉ</div>
    <div class="subtitle">AutoLoc Gestion · Casablanca, Maroc</div>
  </div>
</div>

<!-- KPIs -->
<div style="background:#f7fafc;border-bottom:1px solid #e2e8f0;">
  <div class="kpi-row">
    <div class="kpi-cell accent">
      <div class="kpi-value">{{ number_format($ca_total, 0, ',', ' ') }}</div>
      <div class="kpi-label">Chiffre d'affaires (MAD)</div>
    </div>
    <div class="kpi-cell green">
      <div class="kpi-value">{{ $reservations->sum() }}</div>
      <div class="kpi-label">Total réservations</div>
    </div>
    <div class="kpi-cell">
      <div class="kpi-value">{{ $taux_occupation }}%</div>
      <div class="kpi-label">Taux d'occupation actuel</div>
    </div>
    <div class="kpi-cell orange">
      <div class="kpi-value">{{ $parc_total }}</div>
      <div class="kpi-label">Véhicules au parc</div>
    </div>
  </div>
</div>

<!-- RESERVATIONS PAR STATUT -->
<div class="section">
  <div class="section-title">Répartition des réservations</div>
  <div class="stat-grid">
    <div class="stat-cell">
      <div class="s-label">Terminées</div>
      <div class="s-val terminee">{{ $reservations->get('terminee', 0) }}</div>
    </div>
    <div class="stat-cell">
      <div class="s-label">En cours</div>
      <div class="s-val en_cours">{{ $reservations->get('en_cours', 0) }}</div>
    </div>
    <div class="stat-cell">
      <div class="s-label">Confirmées</div>
      <div class="s-val confirmee">{{ $reservations->get('confirmee', 0) }}</div>
    </div>
    <div class="stat-cell">
      <div class="s-label">En attente</div>
      <div class="s-val en_attente">{{ $reservations->get('en_attente', 0) }}</div>
    </div>
    <div class="stat-cell">
      <div class="s-label">Annulées</div>
      <div class="s-val annulee">{{ $reservations->get('annulee', 0) }}</div>
    </div>
  </div>
</div>

<!-- TOP VEHICULES -->
<div class="section">
  <div class="section-title">Top véhicules du mois</div>
  <table class="data">
    <thead>
      <tr>
        <th style="width:40px;">Rang</th>
        <th>Véhicule</th>
        <th>Immatriculation</th>
        <th>Catégorie</th>
        <th class="num" style="width:100px;">Locations</th>
        <th class="num" style="width:120px;">Revenus (MAD)</th>
      </tr>
    </thead>
    <tbody>
      @foreach($top_vehicules as $i => $tv)
      <tr>
        <td class="center">
          @if($i === 0) <span class="rank-medal">🥇</span>
          @elseif($i === 1) <span class="rank-medal">🥈</span>
          @elseif($i === 2) <span class="rank-medal">🥉</span>
          @else {{ $i + 1 }}
          @endif
        </td>
        <td><strong>{{ $tv->vehicule->marque ?? '—' }} {{ $tv->vehicule->modele ?? '' }}</strong></td>
        <td>{{ $tv->vehicule->immatriculation ?? '—' }}</td>
        <td>
          @php $cat = $tv->vehicule->categorie ?? 'info'; @endphp
          <span class="badge badge-{{ $cat }}">{{ ucfirst($cat) }}</span>
        </td>
        <td class="num">{{ $tv->nb_locations }}</td>
        <td class="num">{{ number_format($tv->revenus ?? 0, 2, ',', ' ') }}</td>
      </tr>
      @endforeach
    </tbody>
  </table>
</div>

<!-- CA PAR JOUR (bar chart) -->
@if($paiements_par_jour->count() > 0)
<div class="section">
  <div class="section-title">Encaissements par jour</div>
  @php $maxVal = $paiements_par_jour->max('total') ?: 1; $trackWidth = 300; @endphp
  <div class="bar-chart">
    @foreach($paiements_par_jour as $p)
    @php $w = max(4, round(($p->total / $maxVal) * $trackWidth)); @endphp
    <div class="bar-row">
      <div class="bar-label">Jour {{ $p->jour }}</div>
      <div class="bar-track"><div class="bar-fill" style="width:{{ $w }}px;"></div></div>
      <div class="bar-val">{{ number_format($p->total, 0, ',', ' ') }} MAD</div>
    </div>
    @endforeach
  </div>
</div>
@endif

<!-- FOOTER -->
<div class="footer">
  <strong>AutoLoc Gestion</strong> · Rapport confidentiel à usage interne · {{ $generated_at }}<br>
  Parc total : {{ $parc_total }} véhicules · Actuellement loués : {{ $parc_loues }} · Taux d'occupation : {{ $taux_occupation }}%
</div>

</body>
</html>
