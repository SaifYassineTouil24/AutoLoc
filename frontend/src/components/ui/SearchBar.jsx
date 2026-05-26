import { useState, useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Search, Car, Users, CalendarCheck, FileText, X, Command, ArrowRight } from 'lucide-react'
import api from '../../lib/api'

const TYPE_CONFIG = {
  vehicule:    { icon: Car,          color: 'text-blue-500',   bg: 'bg-blue-50   dark:bg-blue-950'  },
  client:      { icon: Users,        color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-950' },
  reservation: { icon: CalendarCheck,color: 'text-purple-500', bg: 'bg-purple-50  dark:bg-purple-950' },
  contrat:     { icon: FileText,     color: 'text-amber-500',  bg: 'bg-amber-50   dark:bg-amber-950'  },
}

const STATUT_COLORS = {
  disponible:  'bg-green-100 text-green-700',
  loue:        'bg-blue-100 text-blue-700',
  confirmee:   'bg-emerald-100 text-emerald-700',
  en_cours:    'bg-blue-100 text-blue-700',
  terminee:    'bg-gray-100 text-gray-600',
  annulee:     'bg-red-100 text-red-700',
  signe:       'bg-emerald-100 text-emerald-700',
  brouillon:   'bg-yellow-100 text-yellow-700',
  vip:         'bg-purple-100 text-purple-700',
  standard:    'bg-blue-100 text-blue-700',
  risque:      'bg-red-100 text-red-700',
}

export default function SearchBar() {
  const [open, setOpen]   = useState(false)
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const inputRef = useRef(null)
  const navigate = useNavigate()

  // Cmd+K / Ctrl+K to open
  useEffect(() => {
    function handler(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen(o => !o)
      }
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50)
    else setQuery('')
  }, [open])

  const { data, isFetching } = useQuery({
    queryKey: ['search', query],
    queryFn: () => api.get('/search', { params: { q: query } }).then(r => r.data.results),
    enabled: query.length >= 2,
    staleTime: 10_000,
  })

  const results = data ?? []

  useEffect(() => { setActive(0) }, [results])

  function go(result) {
    navigate(result.url)
    setOpen(false)
    setQuery('')
  }

  function handleKey(e) {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive(a => Math.min(a + 1, results.length - 1)) }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setActive(a => Math.max(a - 1, 0)) }
    if (e.key === 'Enter' && results[active]) go(results[active])
  }

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-3 w-full max-w-md px-4 py-2.5 text-sm text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700 shadow-sm"
      >
        <Search size={16} className="shrink-0" />
        <span className="flex-1 text-left">Rechercher un client, véhicule, contrat…</span>
        <kbd className="hidden sm:flex items-center gap-0.5 text-[10px] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded px-1.5 py-0.5 text-gray-400 shrink-0">
          <Command size={10} />K
        </kbd>
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setOpen(false)} />

          <div className="relative w-full max-w-2xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Input */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 dark:border-gray-800">
              <Search size={20} className="text-gray-400 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Rechercher un client, véhicule, contrat…"
                className="flex-1 text-base bg-transparent outline-none text-gray-900 dark:text-gray-100 placeholder-gray-400"
              />
              {query && (
                <button onClick={() => setQuery('')} className="text-gray-400 hover:text-gray-600">
                  <X size={15} />
                </button>
              )}
              <kbd className="text-[10px] bg-gray-100 dark:bg-gray-800 text-gray-400 border border-gray-200 dark:border-gray-700 rounded px-1.5 py-0.5">ESC</kbd>
            </div>

            {/* Results */}
            <div className="max-h-96 overflow-y-auto">
              {query.length < 2 ? (
                <p className="text-center text-sm text-gray-400 py-10">Tapez au moins 2 caractères…</p>
              ) : isFetching ? (
                <p className="text-center text-sm text-gray-400 py-10">Recherche en cours…</p>
              ) : results.length === 0 ? (
                <p className="text-center text-sm text-gray-400 py-10">Aucun résultat pour « {query} »</p>
              ) : (
                <ul className="py-2">
                  {results.map((r, i) => {
                    const cfg = TYPE_CONFIG[r.type] ?? TYPE_CONFIG.contrat
                    const Icon = cfg.icon
                    return (
                      <li key={i}>
                        <button
                          onClick={() => go(r)}
                          onMouseEnter={() => setActive(i)}
                          className={`flex items-center gap-3 w-full px-4 py-3 text-left transition-colors group/item ${i === active ? 'bg-blue-50 dark:bg-blue-950' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                        >
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${cfg.bg}`}>
                            <Icon size={16} className={cfg.color} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{r.label}</p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 truncate mt-0.5">{r.sublabel}</p>
                          </div>
                          {r.badge && (
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${STATUT_COLORS[r.badge] ?? 'bg-gray-100 text-gray-600'}`}>
                              {r.badge}
                            </span>
                          )}
                          <ArrowRight
                            size={15}
                            className={`shrink-0 transition-all ${i === active ? 'text-blue-500 translate-x-0 opacity-100' : 'text-gray-300 -translate-x-1 opacity-0 group-hover/item:opacity-100 group-hover/item:translate-x-0'}`}
                          />
                        </button>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
