import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import api from '../../lib/api'
import Card, { CardHeader, CardBody } from '../../components/ui/Card'
import Spinner from '../../components/ui/Spinner'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import PageHeader from '../../components/ui/PageHeader'
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell,
} from 'recharts'
import { Brain, TrendingUp, Users, Car, Zap, RefreshCw } from 'lucide-react'
import { useForm } from 'react-hook-form'

const SEG_COLORS = { vip: '#7c3aed', standard: '#3b82f6', risque: '#ef4444' }
const CAT_COLORS = ['#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4']

// ── tabs ─────────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'prevision',      label: 'Prévision demande', icon: TrendingUp },
  { id: 'tarification',   label: 'Tarification IA',   icon: Zap },
  { id: 'scoring',        label: 'Scoring client',     icon: Users },
  { id: 'recommandation', label: 'Recommandations',    icon: Car },
]

export default function Analytique() {
  const [tab, setTab] = useState('prevision')

  const resume = useQuery({
    queryKey: ['analytique-resume'],
    queryFn:  () => api.get('/analytique/resume').then(r => r.data),
    refetchInterval: 60000,
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytique & Intelligence Artificielle"
        subtitle="Prévisions, tarification dynamique, scoring et recommandations"
      />

      {/* KPI cards */}
      {resume.isLoading ? <Spinner /> : resume.data && <ResumeKpis data={resume.data} />}

      {/* Tab bar */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
              ${tab === id ? 'bg-white shadow text-blue-700' : 'text-gray-500 hover:text-gray-800'}`}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'prevision'      && <TabPrevision />}
      {tab === 'tarification'   && <TabTarification />}
      {tab === 'scoring'        && <TabScoring />}
      {tab === 'recommandation' && <TabRecommandation />}
    </div>
  )
}

// ── Resume KPIs ───────────────────────────────────────────────────────────────
function ResumeKpis({ data }) {
  const segs = data.segments ?? {}
  const total = (segs.vip ?? 0) + (segs.standard ?? 0) + (segs.risque ?? 0)
  const pieData = [
    { name: 'VIP',      value: segs.vip      ?? 0 },
    { name: 'Standard', value: segs.standard ?? 0 },
    { name: 'À risque', value: segs.risque   ?? 0 },
  ].filter(d => d.value > 0)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Occupation */}
      <Card className="p-5 flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
          <Car size={26} />
        </div>
        <div>
          <p className="text-sm text-gray-500">Taux d'occupation actuel</p>
          <p className="text-3xl font-bold text-gray-900">{data.taux_occupation}%</p>
          <p className="text-xs text-gray-400">{data.parc_total} véhicules au total</p>
        </div>
      </Card>

      {/* Revenu 7 jours */}
      <Card className="p-5">
        <p className="text-sm text-gray-500 mb-3">Revenus 7 derniers jours</p>
        <ResponsiveContainer width="100%" height={60}>
          <AreaChart data={data.rev_7j ?? []}>
            <defs>
              <linearGradient id="rev7" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area type="monotone" dataKey="total" stroke="#10b981" fill="url(#rev7)" strokeWidth={2} dot={false} />
            <Tooltip formatter={v => [`${v?.toLocaleString('fr-MA')} MAD`]} />
          </AreaChart>
        </ResponsiveContainer>
        <p className="text-xs text-gray-400 mt-1">
          Total : {(data.rev_7j ?? []).reduce((s, d) => s + d.total, 0).toLocaleString('fr-MA')} MAD
        </p>
      </Card>

      {/* Segments clients */}
      <Card className="p-5">
        <p className="text-sm text-gray-500 mb-1">Segments clients ({total} clients)</p>
        <div className="flex items-center gap-3">
          <ResponsiveContainer width={80} height={80}>
            <PieChart>
              <Pie data={pieData} dataKey="value" cx="50%" cy="50%" innerRadius={22} outerRadius={36}>
                {pieData.map((entry, i) => (
                  <Cell key={i} fill={Object.values(SEG_COLORS)[i]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1 text-sm">
            {pieData.map((d, i) => (
              <div key={d.name} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: Object.values(SEG_COLORS)[i] }} />
                <span className="text-gray-600">{d.name}</span>
                <span className="font-bold ml-auto">{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  )
}

// ── Tab: Prévision demande ────────────────────────────────────────────────────
function TabPrevision() {
  const [horizon, setHorizon] = useState(30)

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['prevision', horizon],
    queryFn:  () => api.post('/analytique/prevision-demande', { horizon_jours: horizon }).then(r => r.data),
  })

  const series = horizon === 7 ? (data?.prevision_7j ?? []) : (data?.prevision_30j ?? [])
  const resume = horizon === 7 ? data?.resume_7j : data?.resume_30j

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <select
          value={horizon}
          onChange={e => setHorizon(Number(e.target.value))}
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm bg-white"
        >
          <option value={7}>Horizon 7 jours</option>
          <option value={30}>Horizon 30 jours</option>
        </select>
        <Button variant="secondary" onClick={refetch} loading={isFetching}>
          <RefreshCw size={14} /> Recalculer
        </Button>
        <span className="text-xs text-gray-400 flex items-center gap-1"><Brain size={13} /> Modèle SARIMA saisonnier marocain</span>
      </div>

      {isLoading ? <Spinner /> : data && (
        <>
          {/* Stats résumé */}
          {resume && (
            <div className="grid grid-cols-3 gap-4">
              {[
                ['Minimum prévu', resume.min, 'réservations/jour'],
                ['Moyenne prévue', resume.moyenne, 'réservations/jour'],
                ['Maximum prévu', resume.max, 'réservations/jour'],
              ].map(([label, val, unit]) => (
                <Card key={label} className="p-4 text-center">
                  <p className="text-xs text-gray-500">{label}</p>
                  <p className="text-2xl font-bold text-blue-600">{val}</p>
                  <p className="text-xs text-gray-400">{unit}</p>
                </Card>
              ))}
            </div>
          )}

          {/* Chart réservations */}
          <Card>
            <CardHeader>
              <h2 className="font-semibold text-gray-800">Prévision des réservations ({horizon}j)</h2>
            </CardHeader>
            <CardBody>
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={series}>
                  <defs>
                    <linearGradient id="prevRes" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={horizon === 30 ? 4 : 0} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v, n) => [v, n === 'reservations' ? 'Réservations' : "CA estimé (MAD)"]} />
                  <Legend />
                  <Area type="monotone" dataKey="reservations" name="Réservations" stroke="#3b82f6" fill="url(#prevRes)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>

          {/* Chart CA estimé */}
          <Card>
            <CardHeader>
              <h2 className="font-semibold text-gray-800">CA estimé ({horizon}j) — MAD</h2>
            </CardHeader>
            <CardBody>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={series}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={horizon === 30 ? 4 : 0} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={v => [`${v?.toLocaleString('fr-MA')} MAD`]} />
                  <Bar dataKey="ca_estime" name="CA estimé" fill="#10b981" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>

          {/* Taux occupation prévu */}
          <Card>
            <CardHeader>
              <h2 className="font-semibold text-gray-800">Taux d'occupation prévu (%)</h2>
            </CardHeader>
            <CardBody>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={series}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={horizon === 30 ? 4 : 0} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} unit="%" />
                  <Tooltip formatter={v => [`${v}%`]} />
                  <Line type="monotone" dataKey="taux_prevu" name="Taux prévu" stroke="#f59e0b" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>
        </>
      )}
    </div>
  )
}

// ── Tab: Tarification dynamique ───────────────────────────────────────────────
function TabTarification() {
  const { register, handleSubmit, watch, formState: { isSubmitting } } = useForm({
    defaultValues: { date_debut: '', date_fin: '', vehicule_id: '' },
  })
  const [result, setResult] = useState(null)

  const vehicules = useQuery({
    queryKey: ['vehicules-tarif'],
    queryFn:  () => api.get('/vehicules', { params: { per_page: 100 } }).then(r => r.data.data),
  })

  const mutation = useMutation({
    mutationFn: d => api.post('/analytique/tarification-dynamique', d).then(r => r.data),
    onSuccess: d => setResult(d),
  })

  // Gauge data for the multiplier visual
  const gaugeData = result ? [
    { name: 'Appliqué', value: result.tarif_suggere },
    { name: 'Base',     value: result.tarif_base },
  ] : []

  const pct = result ? Math.round(((result.tarif_suggere - result.tarif_base) / result.tarif_base) * 100) : 0

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader><h2 className="font-semibold text-gray-800">Calculer le tarif optimal</h2></CardHeader>
        <CardBody>
          <form onSubmit={handleSubmit(d => mutation.mutate(d))} className="space-y-4">
            <Select label="Véhicule *" {...register('vehicule_id', { required: true, valueAsNumber: true })}>
              <option value="">Sélectionner un véhicule</option>
              {vehicules.data?.map(v => (
                <option key={v.id} value={v.id}>
                  {v.marque} {v.modele} — {v.tarif_journalier?.toLocaleString('fr-MA')} MAD/j ({v.categorie})
                </option>
              ))}
            </Select>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Date de début *" type="date" {...register('date_debut', { required: true })} />
              <Input label="Date de fin *"   type="date" {...register('date_fin',   { required: true })} />
            </div>
            <Button type="submit" loading={isSubmitting || mutation.isPending}>
              <Brain size={15} /> Calculer le tarif IA
            </Button>
          </form>
        </CardBody>
      </Card>

      {mutation.isPending && <Spinner />}

      {result && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Result summary */}
          <Card className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <Zap className="text-yellow-500" size={28} />
              <div>
                <p className="text-sm text-gray-500">Tarif suggéré par l'IA</p>
                <p className="text-4xl font-bold text-gray-900">{result.tarif_suggere?.toLocaleString('fr-MA')} <span className="text-lg font-normal text-gray-400">MAD/jour</span></p>
              </div>
            </div>

            <div className={`rounded-xl px-4 py-3 text-sm font-medium ${pct > 0 ? 'bg-red-50 text-red-700' : pct < 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-50 text-gray-600'}`}>
              {result.recommandation}
              {pct !== 0 && (
                <span className="ml-2 font-bold">({pct > 0 ? '+' : ''}{pct}% vs tarif de base)</span>
              )}
            </div>

            <div className="grid grid-cols-3 gap-3 text-center text-sm">
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-500">Tarif min</p>
                <p className="font-bold text-gray-700">{result.tarif_min?.toLocaleString('fr-MA')}</p>
              </div>
              <div className="bg-blue-50 rounded-xl p-3">
                <p className="text-xs text-blue-500">Tarif base</p>
                <p className="font-bold text-blue-700">{result.tarif_base?.toLocaleString('fr-MA')}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-500">Tarif max</p>
                <p className="font-bold text-gray-700">{result.tarif_max?.toLocaleString('fr-MA')}</p>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              {[
                ['Multiplicateur occupation', `×${result.multiplicateur_occ}`],
                ['Multiplicateur saisonnier', `×${result.multiplicateur_sf}`],
                ['Taux d\'occupation actuel', `${result.taux_occupation}%`],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-500">{k}</span>
                  <span className="font-medium">{v}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Bar comparison */}
          <Card>
            <CardHeader><h2 className="font-semibold text-gray-800">Comparaison tarifaire</h2></CardHeader>
            <CardBody>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={[
                  { name: 'Min',     tarif: result.tarif_min,     fill: '#94a3b8' },
                  { name: 'Base',    tarif: result.tarif_base,    fill: '#3b82f6' },
                  { name: 'Suggéré', tarif: result.tarif_suggere, fill: pct > 0 ? '#ef4444' : '#10b981' },
                  { name: 'Max',     tarif: result.tarif_max,     fill: '#94a3b8' },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 11 }} unit=" MAD" />
                  <Tooltip formatter={v => [`${v?.toLocaleString('fr-MA')} MAD`]} />
                  <Bar dataKey="tarif" radius={[6, 6, 0, 0]}>
                    {[
                      { fill: '#94a3b8' },
                      { fill: '#3b82f6' },
                      { fill: pct > 0 ? '#ef4444' : '#10b981' },
                      { fill: '#94a3b8' },
                    ].map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  )
}

// ── Tab: Scoring client ───────────────────────────────────────────────────────
function TabScoring() {
  const [result, setResult] = useState(null)
  const { register, handleSubmit, formState: { isSubmitting } } = useForm()

  const clients = useQuery({
    queryKey: ['clients-scoring'],
    queryFn:  () => api.get('/clients', { params: { per_page: 100 } }).then(r => r.data.data),
  })

  const mutation = useMutation({
    mutationFn: d => api.post('/analytique/scoring-client', d).then(r => r.data),
    onSuccess: d => setResult(d),
  })

  const segColor = { vip: 'purple', standard: 'blue', risque: 'red' }
  const segLabel = { vip: 'VIP', standard: 'Standard', risque: 'À risque' }

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader><h2 className="font-semibold text-gray-800">Analyser un client</h2></CardHeader>
        <CardBody>
          <form onSubmit={handleSubmit(d => mutation.mutate(d))} className="flex items-end gap-3">
            <div className="flex-1">
              <Select label="Client *" {...register('client_id', { required: true, valueAsNumber: true })}>
                <option value="">Sélectionner un client</option>
                {clients.data?.map(c => (
                  <option key={c.id} value={c.id}>{c.user?.prenom} {c.user?.name}</option>
                ))}
              </Select>
            </div>
            <Button type="submit" loading={isSubmitting || mutation.isPending}>
              <Brain size={15} /> Calculer le score
            </Button>
          </form>
        </CardBody>
      </Card>

      {mutation.isPending && <Spinner />}

      {result && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Score gauge */}
          <Card className="p-6 space-y-4">
            <div className="text-center">
              <div className={`inline-flex w-28 h-28 rounded-full items-center justify-center text-4xl font-black border-8
                ${result.score >= 75 ? 'border-purple-400 text-purple-700 bg-purple-50'
                : result.score >= 40 ? 'border-blue-400 text-blue-700 bg-blue-50'
                : 'border-red-400 text-red-700 bg-red-50'}`}>
                {result.score}
              </div>
              <p className="mt-2 text-sm text-gray-500">Score de fiabilité / 100</p>
              <span className={`mt-1 inline-block px-3 py-0.5 rounded-full text-xs font-semibold
                ${result.segment === 'vip' ? 'bg-purple-100 text-purple-700'
                : result.segment === 'standard' ? 'bg-blue-100 text-blue-700'
                : 'bg-red-100 text-red-700'}`}>
                {segLabel[result.segment] ?? result.segment}
              </span>
            </div>

            {result.recommandations?.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-semibold text-gray-700">Recommandations</p>
                {result.recommandations.map((r, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                    <span className="text-amber-500 mt-0.5">•</span>
                    <span className="text-amber-800">{r}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Radar détail */}
          <Card>
            <CardHeader><h2 className="font-semibold text-gray-800">Détail par critère</h2></CardHeader>
            <CardBody>
              <ResponsiveContainer width="100%" height={240}>
                <RadarChart data={result.details ?? []}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="critere" tick={{ fontSize: 11 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 30]} tick={{ fontSize: 9 }} />
                  <Radar name="Score" dataKey="score" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                  <Tooltip formatter={(v, n, p) => [`${v} / ${p.payload.max}`]} />
                </RadarChart>
              </ResponsiveContainer>
              <div className="space-y-1 text-xs mt-2">
                {result.details?.map(d => (
                  <div key={d.critere} className="flex items-center gap-2">
                    <span className="w-24 text-gray-500">{d.critere}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${(d.score / d.max) * 100}%` }}
                      />
                    </div>
                    <span className="font-medium w-10 text-right">{d.score}/{d.max}</span>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  )
}

// ── Tab: Recommandation véhicule ──────────────────────────────────────────────
function TabRecommandation() {
  const [result, setResult] = useState(null)
  const { register, handleSubmit, formState: { isSubmitting } } = useForm({
    defaultValues: { budget_jour: '', nb_personnes: 2, usage: 'tourisme' },
  })

  const clients = useQuery({
    queryKey: ['clients-reco'],
    queryFn:  () => api.get('/clients', { params: { per_page: 100 } }).then(r => r.data.data),
  })

  const mutation = useMutation({
    mutationFn: d => api.post('/analytique/recommandation-vehicule', {
      ...d,
      budget_jour:  d.budget_jour ? Number(d.budget_jour) : undefined,
      nb_personnes: Number(d.nb_personnes),
      client_id:    d.client_id ? Number(d.client_id) : undefined,
    }).then(r => r.data),
    onSuccess: d => setResult(d),
  })

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader><h2 className="font-semibold text-gray-800">Trouver le véhicule idéal</h2></CardHeader>
        <CardBody>
          <form onSubmit={handleSubmit(d => mutation.mutate(d))} className="space-y-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Select label="Usage" {...register('usage')}>
                {[['tourisme','Tourisme'],['affaires','Affaires'],['famille','Famille'],['utilitaire','Utilitaire']].map(([v,l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </Select>
              <Input label="Budget/jour (MAD)" type="number" min="0" {...register('budget_jour')} />
              <Input label="Nb de personnes" type="number" min="1" max="9" {...register('nb_personnes')} />
              <Select label="Historique client (optionnel)" {...register('client_id')}>
                <option value="">Sans historique</option>
                {clients.data?.map(c => (
                  <option key={c.id} value={c.id}>{c.user?.prenom} {c.user?.name}</option>
                ))}
              </Select>
            </div>
            <Button type="submit" loading={isSubmitting || mutation.isPending}>
              <Brain size={15} /> Générer les recommandations
            </Button>
          </form>
        </CardBody>
      </Card>

      {mutation.isPending && <Spinner />}

      {result && (
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            {result.nb_vehicules_analyses} véhicules analysés — top {result.recommandations?.length} recommandations
          </p>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {result.recommandations?.map((v, i) => (
              <Card key={v.id} className="p-4 space-y-3 border-l-4" style={{ borderLeftColor: CAT_COLORS[i % CAT_COLORS.length] }}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-bold text-gray-900">{v.marque} {v.modele}</p>
                    <p className="text-xs text-gray-400 capitalize">{v.categorie} · {v.annee}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-blue-600">{v.tarif_journalier?.toLocaleString('fr-MA')} MAD</p>
                    <p className="text-xs text-gray-400">/ jour</p>
                  </div>
                </div>

                {/* Match score bar */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-500">Score de correspondance</span>
                    <span className="font-bold" style={{ color: CAT_COLORS[i % CAT_COLORS.length] }}>{v.score_match}%</span>
                  </div>
                  <div className="bg-gray-100 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all"
                      style={{ width: `${v.score_match}%`, background: CAT_COLORS[i % CAT_COLORS.length] }}
                    />
                  </div>
                </div>

                <p className="text-xs text-gray-500 italic">{v.raison}</p>

                {i === 0 && (
                  <span className="inline-block bg-amber-100 text-amber-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                    Meilleure correspondance
                  </span>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
