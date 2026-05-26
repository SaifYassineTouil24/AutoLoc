"""
AutoLoc AI Microservice — Flask
Endpoints:
  GET  /health
  POST /prevision-demande        demand forecast (7 & 30 days)
  POST /tarification-dynamique   dynamic pricing
  POST /scoring-client           client scoring
  POST /recommandation-vehicule  vehicle recommendations
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
import numpy as np
from datetime import datetime, timedelta
import math

app = Flask(__name__)
CORS(app)

# ── helpers ──────────────────────────────────────────────────────────────────

def _date_range(start: datetime, days: int):
    return [(start + timedelta(days=i)).strftime('%Y-%m-%d') for i in range(days)]

def _seasonal_factor(date: datetime) -> float:
    """Moroccan tourism / rental seasonality (1.0 = average)."""
    m = date.month
    if m in (7, 8):        return 1.45   # peak summer
    if m in (6, 9):        return 1.25
    if m in (12, 1):       return 1.15   # winter holidays
    if m in (3, 4, 5):     return 1.05
    return 0.85

def _trend_factor(days_ahead: int, trend_pct: float = 0.002) -> float:
    """Slight positive trend (0.2% per day)."""
    return 1 + trend_pct * days_ahead

def _noise(scale: float = 0.06) -> float:
    rng = np.random.default_rng()
    return float(rng.normal(1.0, scale))

# ── routes ────────────────────────────────────────────────────────────────────

@app.get('/health')
def health():
    return jsonify({'status': 'ok', 'service': 'AutoLoc AI', 'version': '1.0'})


@app.post('/prevision-demande')
def prevision_demande():
    """
    Body (optional):
      parc_total        int   total fleet size (default 20)
      taux_occupation   float current occupancy 0-100 (default 60)
      ca_moyen_jour     float average daily revenue (default 3000 MAD)
      horizon_jours     int   forecast horizon: 7 or 30 (default 30)
    """
    body = request.get_json(silent=True) or {}
    parc          = int(body.get('parc_total', 20))
    taux          = float(body.get('taux_occupation', 60)) / 100
    ca_base       = float(body.get('ca_moyen_jour', 3000))
    horizon       = min(int(body.get('horizon_jours', 30)), 60)

    today = datetime.today()
    forecast_7  = []
    forecast_30 = []

    for i in range(horizon):
        d    = today + timedelta(days=i + 1)
        sf   = _seasonal_factor(d)
        tf   = _trend_factor(i)
        base = taux * sf * tf * _noise()
        base = max(0.0, min(1.0, base))

        reservations_prev = round(base * parc)
        ca_prev           = round(base * parc * (ca_base / max(parc * taux, 1)) * sf * tf * _noise())

        point = {
            'date':          d.strftime('%Y-%m-%d'),
            'jour':          d.strftime('%A'),
            'reservations':  reservations_prev,
            'ca_estime':     ca_prev,
            'taux_prevu':    round(base * 100, 1),
        }
        if i < 7:
            forecast_7.append(point)
        forecast_30.append(point)

    # summary stats
    def _stats(series):
        vals = [p['reservations'] for p in series]
        return {
            'min': min(vals), 'max': max(vals),
            'moyenne': round(sum(vals) / len(vals), 1),
        }

    return jsonify({
        'prevision_7j':  forecast_7,
        'prevision_30j': forecast_30,
        'resume_7j':     _stats(forecast_7),
        'resume_30j':    _stats(forecast_30),
        'modele':        'SARIMA simulé (saisonnalité marocaine)',
        'genere_le':     datetime.now().isoformat(),
    })


@app.post('/tarification-dynamique')
def tarification_dynamique():
    """
    Body:
      tarif_base        float  base daily rate (MAD)
      taux_occupation   float  current occupancy 0-100
      categorie         str    vehicle category
      tarif_min         float  optional floor (default tarif_base * 0.7)
      tarif_max         float  optional ceiling (default tarif_base * 2.0)
      date_debut        str    YYYY-MM-DD
      date_fin          str    YYYY-MM-DD
    """
    body = request.get_json(silent=True) or {}
    tarif_base  = float(body.get('tarif_base', 500))
    taux        = float(body.get('taux_occupation', 60))
    categorie   = str(body.get('categorie', 'economique'))
    tarif_min   = float(body.get('tarif_min', tarif_base * 0.7))
    tarif_max   = float(body.get('tarif_max', tarif_base * 2.0))
    date_debut  = body.get('date_debut', datetime.today().strftime('%Y-%m-%d'))
    date_fin    = body.get('date_fin',   (datetime.today() + timedelta(days=3)).strftime('%Y-%m-%d'))

    try:
        d_debut = datetime.strptime(date_debut, '%Y-%m-%d')
    except ValueError:
        d_debut = datetime.today()

    # occupancy multiplier: sigmoid-like curve
    # < 40% => discount, 40-70% => neutral, > 70% => premium
    if taux < 40:
        occ_mult = 0.80 + (taux / 40) * 0.20        # 0.80 → 1.00
    elif taux < 70:
        occ_mult = 1.00 + ((taux - 40) / 30) * 0.15 # 1.00 → 1.15
    else:
        occ_mult = 1.15 + ((taux - 70) / 30) * 0.55 # 1.15 → 1.70

    # seasonal multiplier
    sf = _seasonal_factor(d_debut)

    # category premium
    cat_mult = {
        'economique': 1.00, 'compacte': 1.05, 'berline': 1.15,
        'suv': 1.30, 'utilitaire': 1.10, 'luxe': 1.60, 'cabriolet': 1.50,
    }.get(categorie, 1.0)

    tarif_suggere = tarif_base * occ_mult * sf
    tarif_suggere = max(tarif_min, min(tarif_max, round(tarif_suggere)))

    recommandation = (
        'Tarif réduit conseillé : faible occupation'    if taux < 40  else
        'Tarif standard'                                 if taux < 70  else
        'Tarif majoré conseillé : forte demande'
    )

    return jsonify({
        'tarif_suggere':      tarif_suggere,
        'tarif_base':         tarif_base,
        'tarif_min':          tarif_min,
        'tarif_max':          tarif_max,
        'multiplicateur_occ': round(occ_mult, 3),
        'multiplicateur_sf':  round(sf, 3),
        'taux_occupation':    taux,
        'recommandation':     recommandation,
        'economie_client':    round(tarif_base - tarif_suggere) if tarif_suggere < tarif_base else 0,
        'surplus_agence':     round(tarif_suggere - tarif_base) if tarif_suggere > tarif_base else 0,
    })


@app.post('/scoring-client')
def scoring_client():
    """
    Body:
      nb_locations       int    total completed rentals
      nb_retards         int    late returns
      nb_annulations     int    cancellations
      nb_dommages        int    damages reported
      montant_total      float  total spent (MAD)
      note_moyenne       float  avg rating 0-5 (optional)
      anciennete_mois    int    months since first rental
    """
    body = request.get_json(silent=True) or {}
    nb_loc    = max(0, int(body.get('nb_locations', 0)))
    nb_ret    = max(0, int(body.get('nb_retards', 0)))
    nb_ann    = max(0, int(body.get('nb_annulations', 0)))
    nb_dom    = max(0, int(body.get('nb_dommages', 0)))
    montant   = max(0.0, float(body.get('montant_total', 0)))
    note      = min(5.0, max(0.0, float(body.get('note_moyenne', 4.0))))
    anciennete = max(0, int(body.get('anciennete_mois', 0)))

    # weighted scoring model (total = 100)
    # Fidélité 30 pts
    score_fidelite   = min(30, nb_loc * 3)
    # Ponctualité 25 pts
    taux_retard      = nb_ret / max(nb_loc, 1)
    score_ponctualite = round(25 * max(0, 1 - taux_retard * 2))
    # Fiabilité (no damage/cancel) 25 pts
    taux_prob        = (nb_ann + nb_dom) / max(nb_loc, 1)
    score_fiabilite  = round(25 * max(0, 1 - taux_prob * 1.5))
    # Valeur client 10 pts
    score_valeur     = min(10, int(montant / 5000))
    # Ancienneté 10 pts
    score_anciennete = min(10, anciennete // 3)

    score_total = score_fidelite + score_ponctualite + score_fiabilite + score_valeur + score_anciennete
    score_total = max(0, min(100, score_total))

    segment = (
        'vip'      if score_total >= 75 else
        'standard' if score_total >= 40 else
        'risque'
    )

    details = [
        {'critere': 'Fidélité',      'score': score_fidelite,    'max': 30, 'poids': '30%'},
        {'critere': 'Ponctualité',   'score': score_ponctualite, 'max': 25, 'poids': '25%'},
        {'critere': 'Fiabilité',     'score': score_fiabilite,   'max': 25, 'poids': '25%'},
        {'critere': 'Valeur client', 'score': score_valeur,       'max': 10, 'poids': '10%'},
        {'critere': 'Ancienneté',    'score': score_anciennete,   'max': 10, 'poids': '10%'},
    ]

    recommandations = []
    if score_ponctualite < 15:
        recommandations.append('Sensibiliser le client aux retards — appliquer les pénalités horaires')
    if score_fiabilite < 15:
        recommandations.append('Exiger un dépôt de garantie majoré')
    if score_fidelite < 10 and nb_loc > 0:
        recommandations.append('Proposer un programme de fidélité pour encourager les locations répétées')
    if segment == 'vip':
        recommandations.append('Offrir un service prioritaire et des tarifs préférentiels')

    return jsonify({
        'score':           score_total,
        'segment':         segment,
        'details':         details,
        'recommandations': recommandations,
    })


@app.post('/recommandation-vehicule')
def recommandation_vehicule():
    """
    Body:
      historique         list[{categorie, tarif_journalier, nb_locations}]
      budget_jour        float  max daily budget (MAD)
      nb_personnes       int    number of passengers
      usage              str    tourisme | affaires | famille | utilitaire
      vehicules_dispo    list[{id, marque, modele, categorie, tarif_journalier, nb_locations_total}]
    """
    body = request.get_json(silent=True) or {}
    historique    = body.get('historique', [])
    budget        = float(body.get('budget_jour', 999999))
    nb_personnes  = int(body.get('nb_personnes', 2))
    usage         = str(body.get('usage', 'tourisme'))
    vehicules     = body.get('vehicules_dispo', [])

    # ── collaborative: preferred categories from history ──
    cat_count = {}
    for h in historique:
        c = h.get('categorie', '')
        cat_count[c] = cat_count.get(c, 0) + h.get('nb_locations', 1)
    total_hist = sum(cat_count.values()) or 1

    # ── content-based: usage & passengers ──
    usage_cats = {
        'tourisme':    ['compacte', 'berline', 'suv', 'cabriolet'],
        'affaires':    ['berline', 'luxe', 'suv'],
        'famille':     ['suv', 'berline', 'utilitaire'],
        'utilitaire':  ['utilitaire', 'suv'],
    }.get(usage, ['economique', 'compacte'])

    # seats threshold
    seats_cats = (
        ['suv', 'utilitaire', 'berline'] if nb_personnes >= 5 else
        ['economique', 'compacte', 'berline', 'suv', 'cabriolet', 'luxe', 'utilitaire']
    )

    scored = []
    for v in vehicules:
        cat   = v.get('categorie', 'economique')
        tarif = float(v.get('tarif_journalier', 0))

        if tarif > budget:
            continue

        # score 0–100
        score = 0.0
        # collaborative (30%)
        score += 30 * (cat_count.get(cat, 0) / total_hist)
        # content usage match (40%)
        if cat in usage_cats:
            score += 40
        # seats (15%)
        if cat in seats_cats:
            score += 15
        # popularity (15%)
        pop = min(1.0, float(v.get('nb_locations_total', 0)) / 50)
        score += 15 * pop

        raison = []
        if cat in usage_cats:
            raison.append(f'adapté à un usage {usage}')
        if cat_count.get(cat, 0) > 0:
            raison.append('correspond à vos habitudes')
        if pop > 0.5:
            raison.append('très populaire')

        scored.append({**v, 'score_match': round(score, 1), 'raison': ', '.join(raison) or 'disponible dans votre budget'})

    scored.sort(key=lambda x: x['score_match'], reverse=True)

    return jsonify({
        'recommandations': scored[:5],
        'nb_vehicules_analyses': len(vehicules),
        'criteres': {'budget': budget, 'usage': usage, 'nb_personnes': nb_personnes},
    })


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)
