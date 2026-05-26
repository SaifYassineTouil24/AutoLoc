import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ChevronLeft, ChevronRight, Car, CalendarDays, Filter } from 'lucide-react'
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval,
  isSameDay, parseISO, isWithinInterval, addMonths, subMonths,
} from 'date-fns'
import { fr } from 'date-fns/locale'
import api from '../../lib/api'

const STATUT_COLORS = {
  en_cours:  { bg: 'bg-blue-500',   text: 'text-white',  label: 'En cours' },
  confirmee: { bg: 'bg-emerald-500', text: 'text-white',  label: 'Confirmée' },
  en_attente:{ bg: 'bg-amber-400',  text: 'text-white',  label: 'En attente' },
  terminee:  { bg: 'bg-gray-400',   text: 'text-white',  label: 'Terminée' },
}

const CATEGORIE_COLORS = {
  economique:  'bg-green-100 text-green-800',
  compacte:    'bg-blue-100 text-blue-800',
  berline:     'bg-purple-100 text-purple-800',
  suv:         'bg-amber-100 text-amber-800',
  luxe:        'bg-red-100 text-red-800',
  utilitaire:  'bg-gray-100 text-gray-700',
  cabriolet:   'bg-pink-100 text-pink-800',
}

export default function Calendrier() {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedCategorie, setSelectedCategorie] = useState('all')
  const [hoveredRes, setHoveredRes] = useState(null)

  const debut = format(startOfMonth(currentMonth), 'yyyy-MM-dd')
  const fin   = format(endOfMonth(currentMonth), 'yyyy-MM-dd')

  const { data, isLoading } = useQuery({
    queryKey: ['calendrier', debut, fin],
    queryFn: () => api.get('/calendrier', { params: { debut, fin } }).then(r => r.data),
    staleTime: 60_000,
  })

  const reservations = data?.reservations ?? []
  const vehicules = data?.vehicules ?? []

  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end:   endOfMonth(currentMonth),
  })

  const vehiculesFiltres = useMemo(() =>
    selectedCategorie === 'all'
      ? vehicules
      : vehicules.filter(v => v.categorie === selectedCategorie),
    [vehicules, selectedCategorie]
  )

  const categories = useMemo(() =>
    [...new Set(vehicules.map(v => v.categorie))].sort(),
    [vehicules]
  )

  // For each vehicle x day, find the reservation(s)
  function getCell(vehiculeId, day) {
    return reservations.filter(r =>
      r.vehicule_id === vehiculeId &&
      isWithinInterval(day, {
        start: parseISO(r.debut),
        end:   parseISO(r.fin),
      })
    )
  }

  // Is this day the start of a reservation block?
  function isStart(r, day) { return isSameDay(parseISO(r.debut), day) }
  function isEnd(r, day)   { return isSameDay(parseISO(r.fin),   day) }

  const stats = useMemo(() => {
    const total = vehiculesFiltres.length
    const occupied = new Set(reservations.filter(r =>
      ['en_cours', 'confirmee'].includes(r.statut)
    ).map(r => r.vehicule_id)).size
    return { total, occupied, taux: total > 0 ? Math.round((occupied / total) * 100) : 0 }
  }, [vehiculesFiltres, reservations])

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Calendrier de disponibilité</h1>
          <p className="text-sm text-gray-500 mt-0.5">Vue mensuelle des réservations par véhicule</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5 text-xs">
            {Object.entries(STATUT_COLORS).map(([s, c]) => (
              <span key={s} className={`px-2 py-1 rounded-full ${c.bg} ${c.text} font-medium`}>{c.label}</span>
            ))}
          </div>
        </div>
      </div>

      {/* KPI + Controls */}
      <div className="flex items-center justify-between gap-4 bg-white rounded-xl border border-gray-200 px-5 py-4">
        <div className="flex items-center gap-6">
          <div>
            <p className="text-xs text-gray-500">Véhicules affichés</p>
            <p className="text-xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Actuellement loués</p>
            <p className="text-xl font-bold text-blue-600">{stats.occupied}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Taux d'occupation</p>
            <p className="text-xl font-bold text-emerald-600">{stats.taux}%</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Category filter */}
          <div className="flex items-center gap-2">
            <Filter size={15} className="text-gray-400" />
            <select
              value={selectedCategorie}
              onChange={e => setSelectedCategorie(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Toutes catégories</option>
              {categories.map(c => (
                <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
              ))}
            </select>
          </div>

          {/* Month nav */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setCurrentMonth(m => subMonths(m, 1))}
              className="p-1.5 rounded-md hover:bg-white transition-colors text-gray-600"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="px-3 text-sm font-semibold text-gray-800 min-w-[130px] text-center capitalize">
              {format(currentMonth, 'MMMM yyyy', { locale: fr })}
            </span>
            <button
              onClick={() => setCurrentMonth(m => addMonths(m, 1))}
              className="p-1.5 rounded-md hover:bg-white transition-colors text-gray-600"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-24 text-gray-400">
            <CalendarDays size={40} className="animate-pulse" />
          </div>
        ) : vehiculesFiltres.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-gray-400">
            <Car size={40} className="mb-3 opacity-30" />
            <p>Aucun véhicule dans cette catégorie</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse" style={{ minWidth: `${days.length * 34 + 200}px` }}>
              <thead>
                <tr>
                  <th className="sticky left-0 z-10 bg-gray-50 border-b border-r border-gray-200 px-3 py-3 text-left font-semibold text-gray-600 w-48">
                    Véhicule
                  </th>
                  {days.map(day => {
                    const isToday = isSameDay(day, new Date())
                    return (
                      <th
                        key={day.toISOString()}
                        className={`border-b border-r border-gray-100 px-1 py-2 text-center font-medium w-8 ${
                          isToday ? 'bg-blue-50 text-blue-700' : 'bg-gray-50 text-gray-500'
                        }`}
                      >
                        <div>{format(day, 'EEE', { locale: fr }).slice(0, 2)}</div>
                        <div className={`font-bold ${isToday ? 'text-blue-700' : 'text-gray-700'}`}>
                          {format(day, 'd')}
                        </div>
                      </th>
                    )
                  })}
                </tr>
              </thead>
              <tbody>
                {vehiculesFiltres.map(vehicule => (
                  <tr key={vehicule.id} className="group hover:bg-gray-50/50">
                    {/* Vehicle name */}
                    <td className="sticky left-0 z-10 bg-white group-hover:bg-gray-50/50 border-b border-r border-gray-100 px-3 py-2">
                      <div className="font-semibold text-gray-800 truncate max-w-[160px]">
                        {vehicule.marque} {vehicule.modele}
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-gray-400">{vehicule.immatriculation}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-medium ${CATEGORIE_COLORS[vehicule.categorie] ?? 'bg-gray-100 text-gray-600'}`}>
                          {vehicule.categorie}
                        </span>
                      </div>
                    </td>

                    {/* Day cells */}
                    {days.map(day => {
                      const cells = getCell(vehicule.id, day)
                      const isToday = isSameDay(day, new Date())

                      return (
                        <td
                          key={day.toISOString()}
                          className={`border-b border-r border-gray-100 p-0 h-10 relative ${isToday ? 'bg-blue-50/30' : ''}`}
                        >
                          {cells.map(r => {
                            const cfg = STATUT_COLORS[r.statut] ?? STATUT_COLORS.terminee
                            const start = isStart(r, day)
                            const end   = isEnd(r, day)
                            return (
                              <div
                                key={r.id}
                                onMouseEnter={() => setHoveredRes(r)}
                                onMouseLeave={() => setHoveredRes(null)}
                                title={`${r.client?.nom ?? 'Client'} · ${r.vehicule?.marque} ${r.vehicule?.modele}\n${r.debut} → ${r.fin}\n${Number(r.prix_total).toLocaleString('fr-MA')} MAD`}
                                className={`absolute inset-y-1 ${cfg.bg} ${cfg.text} cursor-pointer transition-opacity hover:opacity-90
                                  ${start ? 'left-1 rounded-l-md' : 'left-0'}
                                  ${end   ? 'right-1 rounded-r-md' : 'right-0'}
                                `}
                              >
                                {start && (
                                  <div className="px-1.5 h-full flex items-center overflow-hidden">
                                    <span className="truncate text-[10px] font-medium whitespace-nowrap">
                                      {r.client?.nom ?? r.numero}
                                    </span>
                                  </div>
                                )}
                              </div>
                            )
                          })}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Tooltip / selected reservation detail */}
      {hoveredRes && (
        <div className="fixed bottom-6 right-6 bg-gray-900 text-white rounded-xl shadow-2xl p-4 z-50 w-72 pointer-events-none">
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${STATUT_COLORS[hoveredRes.statut]?.bg ?? 'bg-gray-500'}`}>
              {STATUT_COLORS[hoveredRes.statut]?.label ?? hoveredRes.statut}
            </span>
            <span className="text-gray-400 text-xs">{hoveredRes.numero}</span>
          </div>
          <p className="font-semibold">{hoveredRes.vehicule?.marque} {hoveredRes.vehicule?.modele}</p>
          <p className="text-gray-300 text-sm">{hoveredRes.client?.nom ?? '—'}</p>
          <div className="mt-2 text-xs text-gray-400 space-y-1">
            <p>Du {format(parseISO(hoveredRes.debut), 'dd MMM yyyy', { locale: fr })}</p>
            <p>Au {format(parseISO(hoveredRes.fin), 'dd MMM yyyy', { locale: fr })}</p>
            <p className="text-white font-semibold text-sm mt-1">
              {Number(hoveredRes.prix_total).toLocaleString('fr-MA')} MAD
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
