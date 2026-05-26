import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Car, Search, Filter, MapPin, Star, Fuel, Users, Settings2, ChevronDown, ChevronUp } from 'lucide-react'
import api from '../../lib/api'

const CATEGORIE_LABEL = {
  economique:  { label: 'Économique',  color: 'bg-green-100 text-green-800',  border: 'border-green-200' },
  compacte:    { label: 'Compacte',    color: 'bg-blue-100 text-blue-800',    border: 'border-blue-200' },
  berline:     { label: 'Berline',     color: 'bg-purple-100 text-purple-800', border: 'border-purple-200' },
  suv:         { label: 'SUV',         color: 'bg-amber-100 text-amber-800',   border: 'border-amber-200' },
  luxe:        { label: 'Luxe',        color: 'bg-red-100 text-red-800',       border: 'border-red-200' },
  utilitaire:  { label: 'Utilitaire',  color: 'bg-gray-100 text-gray-700',    border: 'border-gray-200' },
  cabriolet:   { label: 'Cabriolet',   color: 'bg-pink-100 text-pink-800',    border: 'border-pink-200' },
}

const ENERGIE_ICON = {
  essence:    '⛽',
  diesel:     '🛢️',
  hybride:    '🔋',
  electrique: '⚡',
  gpl:        '💨',
}

const SORT_OPTIONS = [
  { value: 'prix_asc',  label: 'Prix croissant' },
  { value: 'prix_desc', label: 'Prix décroissant' },
  { value: 'marque',    label: 'Marque A→Z' },
]

function VehiculeCard({ v, onReserver }) {
  const catCfg = CATEGORIE_LABEL[v.categorie] ?? { label: v.categorie, color: 'bg-gray-100 text-gray-700', border: 'border-gray-200' }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex flex-col">
      {/* Image placeholder */}
      <div className="relative h-44 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center overflow-hidden">
        {v.photo_principale ? (
          <img src={`/storage/${v.photo_principale}`} alt={`${v.marque} ${v.modele}`} className="w-full h-full object-cover" />
        ) : (
          <Car size={64} className="text-slate-300" />
        )}
        <span className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-semibold ${catCfg.color}`}>
          {catCfg.label}
        </span>
        <span className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-full text-xs font-bold text-emerald-600 border border-emerald-200">
          Disponible
        </span>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-bold text-gray-900 text-base">{v.marque} {v.modele}</h3>
            <p className="text-gray-400 text-xs mt-0.5">{v.annee} · {v.couleur}</p>
          </div>
          <div className="text-right">
            <p className="text-xl font-bold text-gray-900">{Number(v.tarif_journalier).toLocaleString('fr-MA')}</p>
            <p className="text-xs text-gray-400">MAD / jour</p>
          </div>
        </div>

        {/* Specs */}
        <div className="grid grid-cols-2 gap-2 mt-3">
          {v.energie && (
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <Fuel size={13} className="text-gray-400 shrink-0" />
              <span className="capitalize">{v.energie} {ENERGIE_ICON[v.energie]}</span>
            </div>
          )}
          {v.nombre_places && (
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <Users size={13} className="text-gray-400 shrink-0" />
              <span>{v.nombre_places} places</span>
            </div>
          )}
          {v.boite_vitesse && (
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <Settings2 size={13} className="text-gray-400 shrink-0" />
              <span className="capitalize">{v.boite_vitesse}</span>
            </div>
          )}
          {v.depot_garantie && (
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <Star size={13} className="text-gray-400 shrink-0" />
              <span>Dépôt {Number(v.depot_garantie).toLocaleString('fr-MA')} MAD</span>
            </div>
          )}
        </div>

        {v.description && (
          <p className="text-xs text-gray-500 mt-2 line-clamp-2">{v.description}</p>
        )}

        {/* CTA */}
        <div className="mt-auto pt-4">
          <button
            onClick={() => onReserver(v)}
            className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors"
          >
            Réserver ce véhicule
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Catalogue() {
  const [search, setSearch] = useState('')
  const [categorie, setCategorie] = useState('all')
  const [prixMax, setPrixMax] = useState('')
  const [sortBy, setSortBy] = useState('prix_asc')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedVehicule, setSelectedVehicule] = useState(null)

  const { data: vehicules = [], isLoading } = useQuery({
    queryKey: ['catalogue'],
    queryFn: () => api.get('/catalogue').then(r => r.data),
    staleTime: 5 * 60_000,
  })

  const categories = useMemo(() =>
    [...new Set(vehicules.map(v => v.categorie))].sort(),
    [vehicules]
  )

  const filtered = useMemo(() => {
    let list = [...vehicules]

    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(v =>
        v.marque.toLowerCase().includes(q) ||
        v.modele.toLowerCase().includes(q) ||
        v.categorie.toLowerCase().includes(q)
      )
    }
    if (categorie !== 'all') {
      list = list.filter(v => v.categorie === categorie)
    }
    if (prixMax) {
      list = list.filter(v => Number(v.tarif_journalier) <= Number(prixMax))
    }

    if (sortBy === 'prix_asc')  list.sort((a, b) => a.tarif_journalier - b.tarif_journalier)
    if (sortBy === 'prix_desc') list.sort((a, b) => b.tarif_journalier - a.tarif_journalier)
    if (sortBy === 'marque')    list.sort((a, b) => a.marque.localeCompare(b.marque))

    return list
  }, [vehicules, search, categorie, prixMax, sortBy])

  function handleReserver(v) {
    setSelectedVehicule(v)
    window.location.href = `/login?redirect=/reservations&vehicule_id=${v.id}`
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 text-white py-14 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Car size={28} className="text-blue-400" />
            <span className="font-bold text-2xl tracking-tight">AutoLoc</span>
          </div>
          <h1 className="text-4xl font-bold mb-3">Notre catalogue de véhicules</h1>
          <p className="text-slate-300 text-lg mb-2">
            Découvrez notre flotte disponible — des tarifs adaptés à chaque budget
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-slate-400">
            <MapPin size={14} />
            <span>Casablanca · Rabat · Marrakech · Agadir · Fès</span>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
          <div className="flex flex-col md:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un véhicule (marque, modèle…)"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Category pills */}
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setCategorie('all')}
                className={`px-3 py-2 rounded-xl text-sm font-medium border transition-all ${
                  categorie === 'all'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
                }`}
              >
                Tous
              </button>
              {categories.map(c => {
                const cfg = CATEGORIE_LABEL[c] ?? { label: c, color: '' }
                return (
                  <button
                    key={c}
                    onClick={() => setCategorie(c)}
                    className={`px-3 py-2 rounded-xl text-sm font-medium border transition-all ${
                      categorie === c
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    {cfg.label}
                  </button>
                )
              })}
            </div>

            {/* More filters */}
            <button
              onClick={() => setShowFilters(o => !o)}
              className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <Filter size={15} />
              Filtres
              {showFilters ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </div>

          {showFilters && (
            <div className="flex gap-4 mt-4 pt-4 border-t border-gray-100">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Prix max / jour (MAD)</label>
                <input
                  type="number"
                  placeholder="ex: 500"
                  value={prixMax}
                  onChange={e => setPrixMax(e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-40 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Trier par</label>
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {SORT_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Results count */}
        <div className="flex items-center justify-between mt-4 mb-3">
          <p className="text-sm text-gray-500">
            {isLoading ? 'Chargement…' : `${filtered.length} véhicule${filtered.length !== 1 ? 's' : ''} disponible${filtered.length !== 1 ? 's' : ''}`}
          </p>
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-200 overflow-hidden animate-pulse">
                <div className="h-44 bg-gray-100" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-100 rounded w-3/4" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                  <div className="h-10 bg-gray-100 rounded-xl mt-4" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-gray-400">
            <Car size={48} className="mb-4 opacity-30" />
            <p className="text-lg font-medium">Aucun véhicule ne correspond à vos critères</p>
            <button
              onClick={() => { setSearch(''); setCategorie('all'); setPrixMax('') }}
              className="mt-4 text-blue-600 text-sm hover:underline"
            >
              Réinitialiser les filtres
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map(v => (
              <VehiculeCard key={v.id} v={v} onReserver={handleReserver} />
            ))}
          </div>
        )}

        {/* Footer CTA */}
        <div className="mt-12 bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-8 text-white text-center">
          <h2 className="text-xl font-bold mb-2">Besoin d'un véhicule personnalisé ?</h2>
          <p className="text-blue-200 mb-5">Contactez notre équipe pour des tarifs spéciaux longue durée ou flotte entreprise.</p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <a href="tel:+212522000000" className="bg-white text-blue-700 font-semibold px-5 py-2.5 rounded-xl hover:bg-blue-50 transition-colors text-sm">
              📞 +212 5 22 00 00 00
            </a>
            <a href="/login" className="bg-blue-500 hover:bg-blue-400 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm border border-blue-400">
              Se connecter pour réserver
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
