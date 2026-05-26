import { useQuery } from '@tanstack/react-query'
import api, { downloadPdf } from '../../lib/api'
import { useAuth } from '../../contexts/AuthContext'
import Card, { CardHeader, CardBody } from '../../components/ui/Card'
import Spinner from '../../components/ui/Spinner'
import Badge, { statutColor, statutLabel } from '../../components/ui/Badge'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts'
import { Car, Users, CalendarCheck, TrendingUp, AlertTriangle, Wrench, Download, Clock, FileText, CheckCircle2, UserCheck } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

const PIE_COLORS = { vip: '#7c3aed', standard: '#3b82f6', risque: '#ef4444' }

function KpiCard({ label, value, icon: Icon, color = 'blue', sub }) {
  const colors = {
    blue:   'bg-blue-50 text-blue-600',
    green:  'bg-emerald-50 text-emerald-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    red:    'bg-red-50 text-red-600',
    purple: 'bg-purple-50 text-purple-600',
  }
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value ?? '—'}</p>
          {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colors[color]}`}>
          <Icon size={20} />
        </div>
      </div>
    </Card>
  )
}

export default function Dashboard() {
  const { isClient } = useAuth()

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn:  () => api.get('/dashboard').then(r => r.data),
    refetchInterval: 30000,
  })

  if (isLoading) return <Spinner />

  if (!data) return null
  if (isClient)           return <ClientDashboard data={data} />
  if (data.type === 'employe') return <EmployeDashboard data={data} />
  return <StaffDashboard data={data} />
}

function StaffDashboard({ data }) {
  const { kpi, graphiques } = data
  const [pdfLoading, setPdfLoading] = useState(false)

  async function handleRapportPdf() {
    setPdfLoading(true)
    try {
      const now = new Date()
      await downloadPdf(
        `/pdf/rapport-mensuel?mois=${now.getMonth() + 1}&annee=${now.getFullYear()}`,
        `rapport-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}.pdf`
      )
    } catch {
      toast.error('Erreur lors du téléchargement du rapport')
    } finally {
      setPdfLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Tableau de bord</h1>
          <p className="text-sm text-gray-500">Vue en temps réel de l'activité</p>
        </div>
        <button
          onClick={handleRapportPdf}
          disabled={pdfLoading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition-colors"
        >
          <Download size={15} className={pdfLoading ? 'animate-bounce' : ''} />
          {pdfLoading ? 'Génération…' : 'Rapport mensuel PDF'}
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Taux d'occupation" value={`${kpi.taux_occupation}%`} icon={Car}           color="blue" sub={`${kpi.parc_loues}/${kpi.parc_total} véhicules`} />
        <KpiCard label="CA du jour"         value={`${kpi.ca_journalier?.toLocaleString('fr-MA')} MAD`} icon={TrendingUp} color="green" />
        <KpiCard label="Réservations actives" value={kpi.reservations_actives} icon={CalendarCheck} color="purple" />
        <KpiCard label="Score moyen clients" value={`${kpi.score_moyen_clients}/100`} icon={Users} color="yellow" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="CA mensuel"           value={`${kpi.ca_mensuel?.toLocaleString('fr-MA')} MAD`} icon={TrendingUp} color="green" />
        <KpiCard label="En maintenance"       value={kpi.parc_maintenance}  icon={Wrench}         color="yellow" />
        <KpiCard label="Taux d'annulation"    value={`${kpi.taux_annulation}%`} icon={CalendarCheck} color="red" />
        <KpiCard label="Alertes obligations"  value={kpi.alertes_obligations} icon={AlertTriangle} color="red" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-gray-800">Chiffre d'affaires mensuel</h2>
          </CardHeader>
          <CardBody>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={graphiques.ca_mensuel}>
                <defs>
                  <linearGradient id="ca" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="mois" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={v => [`${v?.toLocaleString('fr-MA')} MAD`]} />
                <Area type="monotone" dataKey="total" stroke="#3b82f6" fill="url(#ca)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="font-semibold text-gray-800">Segments clients</h2>
          </CardHeader>
          <CardBody className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={graphiques.segments_clients} dataKey="total" nameKey="segment" cx="50%" cy="50%" outerRadius={80} label={({ segment, total }) => `${segment}: ${total}`}>
                  {graphiques.segments_clients?.map((entry, i) => (
                    <Cell key={i} fill={PIE_COLORS[entry.segment] ?? '#94a3b8'} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>
      </div>

      {/* Top véhicules */}
      <Card>
        <CardHeader>
          <h2 className="font-semibold text-gray-800">Véhicules les plus loués</h2>
        </CardHeader>
        <CardBody>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={graphiques.top_vehicules} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey={d => `${d.vehicule?.marque} ${d.vehicule?.modele}`} width={140} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="nb_locations" fill="#3b82f6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardBody>
      </Card>

      <RapportEmployes />
    </div>
  )
}

function ClientDashboard({ data }) {
  if (!data) return null
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-900">Mon espace</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Score de fiabilité"  value={`${data.score}/100`} icon={TrendingUp} color="blue" sub={statutLabel(data.segment)} />
        <KpiCard label="Locations terminées" value={data.nb_locations}   icon={Car}        color="green" />
        <KpiCard label="Total dépensé"       value={`${data.total_depense?.toLocaleString('fr-MA')} MAD`} icon={TrendingUp} color="purple" />
        <KpiCard label="Réservations actives" value={data.reservations_actives?.length} icon={CalendarCheck} color="yellow" />
      </div>

      {data.reservations_actives?.length > 0 && (
        <Card>
          <CardHeader><h2 className="font-semibold text-gray-800">Réservations en cours</h2></CardHeader>
          <CardBody className="space-y-3">
            {data.reservations_actives.map(r => (
              <div key={r.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-sm">{r.vehicule?.marque} {r.vehicule?.modele}</p>
                  <p className="text-xs text-gray-500">{new Date(r.date_debut).toLocaleDateString('fr-FR')} → {new Date(r.date_fin).toLocaleDateString('fr-FR')}</p>
                </div>
                <Badge color={statutColor(r.statut)}>{statutLabel(r.statut)}</Badge>
              </div>
            ))}
          </CardBody>
        </Card>
      )}
    </div>
  )
}

/* ─── Employee Dashboard ─── */
function EmployeDashboard({ data }) {
  const { mes_reservations, reservations_aujd, en_attente, ca_personnel, nb_contrats_personnel } = data

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Mon espace de travail</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Vos tâches et activité du mois</p>
      </div>

      {/* Personal KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="CA généré ce mois"    value={`${Number(ca_personnel).toLocaleString('fr-MA')} MAD`} icon={TrendingUp} color="green" />
        <KpiCard label="Contrats ce mois"     value={nb_contrats_personnel} icon={FileText}    color="blue" />
        <KpiCard label="Réservations actives" value={mes_reservations?.length ?? 0} icon={CalendarCheck} color="purple" />
        <KpiCard label="En attente de confirmation" value={en_attente?.length ?? 0} icon={Clock} color="yellow" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 font-semibold text-gray-800 dark:text-gray-200">
              <CalendarCheck size={16} className="text-blue-500" />
              Aujourd'hui ({reservations_aujd?.length ?? 0})
            </div>
          </CardHeader>
          <CardBody>
            {!reservations_aujd?.length ? (
              <p className="text-sm text-gray-400 text-center py-4">Aucune réservation aujourd'hui</p>
            ) : reservations_aujd.map(r => (
              <div key={r.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl mb-2">
                <div>
                  <p className="font-semibold text-sm dark:text-gray-200">{r.vehicule?.marque} {r.vehicule?.modele}</p>
                  <p className="text-xs text-gray-500">{r.client?.user?.prenom} {r.client?.user?.name}</p>
                </div>
                <div className="text-right text-xs text-gray-400">
                  <p>{format(new Date(r.date_debut), 'dd MMM', { locale: fr })}</p>
                  <p>→ {format(new Date(r.date_fin), 'dd MMM', { locale: fr })}</p>
                </div>
              </div>
            ))}
          </CardBody>
        </Card>

        {/* Pending confirmation */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 font-semibold text-gray-800 dark:text-gray-200">
              <Clock size={16} className="text-amber-500" />
              À confirmer ({en_attente?.length ?? 0})
            </div>
          </CardHeader>
          <CardBody>
            {!en_attente?.length ? (
              <p className="text-sm text-gray-400 text-center py-4">Aucune réservation en attente</p>
            ) : en_attente.map(r => (
              <div key={r.id} className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl mb-2">
                <div>
                  <p className="font-semibold text-sm dark:text-gray-200">{r.numero_reservation}</p>
                  <p className="text-xs text-gray-500">{r.vehicule?.marque} {r.vehicule?.modele}</p>
                </div>
                <Badge color="yellow">En attente</Badge>
              </div>
            ))}
          </CardBody>
        </Card>
      </div>
    </div>
  )
}

/* ─── Admin Employee Report (shown inside StaffDashboard) ─── */
export function RapportEmployes() {
  const { data, isLoading } = useQuery({
    queryKey: ['rapport-employes'],
    queryFn: () => api.get('/dashboard/rapport-employes').then(r => r.data),
    staleTime: 60_000,
  })

  if (isLoading) return <Spinner />

  const { employes = [], mois } = data ?? {}

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2 font-semibold text-gray-800 dark:text-gray-200">
          <UserCheck size={16} className="text-blue-500" />
          Performance équipe — {mois}
        </div>
      </CardHeader>
      <CardBody>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                {['Agent', 'Rôle', 'Réservations', 'Contrats', 'Retours', 'CA généré', 'Dernière connexion'].map(h => (
                  <th key={h} className="text-left text-xs text-gray-400 uppercase tracking-wider pb-2 pr-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {employes.map(e => (
                <tr key={e.id} className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/30">
                  <td className="py-2.5 pr-4 font-medium dark:text-gray-200">{e.nom}</td>
                  <td className="py-2.5 pr-4">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${e.role === 'administrateur' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                      {e.role === 'administrateur' ? 'Admin' : 'Employé'}
                    </span>
                  </td>
                  <td className="py-2.5 pr-4 font-semibold text-gray-700 dark:text-gray-300">{e.nb_reservations}</td>
                  <td className="py-2.5 pr-4 font-semibold text-gray-700 dark:text-gray-300">{e.nb_contrats}</td>
                  <td className="py-2.5 pr-4 font-semibold text-gray-700 dark:text-gray-300">{e.nb_retours}</td>
                  <td className="py-2.5 pr-4 font-semibold text-emerald-600">{Number(e.ca_genere).toLocaleString('fr-MA')} MAD</td>
                  <td className="py-2.5 text-xs text-gray-400">
                    {e.last_login_at ? format(new Date(e.last_login_at), 'dd MMM HH:mm', { locale: fr }) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardBody>
    </Card>
  )
}
