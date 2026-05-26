import { useState, useRef, useEffect } from 'react'
import { Bell, Check, CheckCheck, Trash2, X, Info, AlertTriangle, AlertCircle, CalendarClock, Wrench, CreditCard } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import api from '../../lib/api'

const TYPE_CONFIG = {
  reservation_rappel: { icon: CalendarClock, color: 'text-blue-500', bg: 'bg-blue-50' },
  maintenance_due:    { icon: Wrench,        color: 'text-orange-500', bg: 'bg-orange-50' },
  paiement_retard:    { icon: CreditCard,    color: 'text-red-500',    bg: 'bg-red-50' },
  contrat_expirant:   { icon: AlertTriangle, color: 'text-yellow-500', bg: 'bg-yellow-50' },
  obligation_vehicule:{ icon: AlertCircle,   color: 'text-purple-500', bg: 'bg-purple-50' },
  info:               { icon: Info,          color: 'text-gray-500',   bg: 'bg-gray-50' },
}

const PRIORITE_DOT = {
  haute:   'bg-red-500',
  normale: 'bg-blue-400',
  basse:   'bg-gray-300',
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)
  if (mins < 1)   return "à l'instant"
  if (mins < 60)  return `il y a ${mins} min`
  if (hours < 24) return `il y a ${hours}h`
  return `il y a ${days}j`
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const navigate = useNavigate()
  const qc = useQueryClient()

  const { data } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.get('/notifications').then(r => r.data),
    refetchInterval: 30_000,
    staleTime: 20_000,
  })

  const notifications = data?.notifications ?? []
  const nonLues = data?.non_lues ?? 0

  const marquerLu = useMutation({
    mutationFn: (id) => api.post(`/notifications/${id}/lire`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  })

  const toutLire = useMutation({
    mutationFn: () => api.post('/notifications/tout-lire'),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  })

  const supprimer = useMutation({
    mutationFn: (id) => api.delete(`/notifications/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  })

  // Close on outside click
  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  function handleClick(notif) {
    if (!notif.lu) marquerLu.mutate(notif.id)
    if (notif.lien) {
      navigate(notif.lien)
      setOpen(false)
    }
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="relative p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      >
        <Bell size={20} />
        {nonLues > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none">
            {nonLues > 9 ? '9+' : nonLues}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-96 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-50 flex flex-col max-h-130">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-2">
              <Bell size={16} className="text-gray-600 dark:text-gray-400" />
              <span className="font-semibold text-gray-800 dark:text-gray-200 text-sm">Notifications</span>
              {nonLues > 0 && (
                <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">{nonLues} non lue{nonLues > 1 ? 's' : ''}</span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {nonLues > 0 && (
                <button
                  onClick={() => toutLire.mutate()}
                  title="Tout marquer comme lu"
                  className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                >
                  <CheckCheck size={15} />
                </button>
              )}
              <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800">
                <X size={15} />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="overflow-y-auto flex-1">
            {notifications.length === 0 ? (
              <div className="py-12 text-center text-gray-400 text-sm">
                <Bell size={32} className="mx-auto mb-3 opacity-30" />
                Aucune notification
              </div>
            ) : (
              notifications.map(notif => {
                const cfg = TYPE_CONFIG[notif.type] ?? TYPE_CONFIG.info
                const Icon = cfg.icon
                return (
                  <div
                    key={notif.id}
                    className={`flex gap-3 px-4 py-3 border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group ${!notif.lu ? 'bg-blue-50/40 dark:bg-blue-900/20' : ''}`}
                  >
                    <div className={`shrink-0 w-9 h-9 rounded-full ${cfg.bg} flex items-center justify-center mt-0.5`}>
                      <Icon size={16} className={cfg.color} />
                    </div>

                    <div
                      className="flex-1 min-w-0 cursor-pointer"
                      onClick={() => handleClick(notif)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-sm font-medium text-gray-900 dark:text-gray-100 leading-tight ${!notif.lu ? 'font-semibold' : ''}`}>
                          {notif.titre}
                        </p>
                        <div className="flex items-center gap-1 shrink-0">
                          <span className={`w-2 h-2 rounded-full ${PRIORITE_DOT[notif.priorite] ?? 'bg-gray-300'}`} title={`Priorité ${notif.priorite}`} />
                          {!notif.lu && <span className="w-2 h-2 bg-blue-500 rounded-full" />}
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">{notif.message}</p>
                      <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">{timeAgo(notif.created_at)}</p>
                    </div>

                    <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      {!notif.lu && (
                        <button
                          onClick={() => marquerLu.mutate(notif.id)}
                          title="Marquer comme lu"
                          className="p-1 rounded text-gray-400 hover:text-green-600 hover:bg-green-50"
                        >
                          <Check size={13} />
                        </button>
                      )}
                      <button
                        onClick={() => supprimer.mutate(notif.id)}
                        title="Supprimer"
                        className="p-1 rounded text-gray-400 hover:text-red-500 hover:bg-red-50"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}
