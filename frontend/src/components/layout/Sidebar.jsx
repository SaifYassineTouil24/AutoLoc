import { NavLink } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import {
  LayoutDashboard, Car, Users, CalendarCheck, FileText,
  CreditCard, RotateCcw, Wrench, ShieldCheck, LogOut, X, Brain, CalendarDays, MessageSquare,
} from 'lucide-react'

const navItems = [
  { to: '/dashboard',    label: 'Tableau de bord', icon: LayoutDashboard, roles: ['administrateur', 'employe', 'client'] },
  { to: '/vehicules',    label: 'Véhicules',        icon: Car,             roles: ['administrateur', 'employe'] },
  { to: '/clients',      label: 'Clients',          icon: Users,           roles: ['administrateur', 'employe'] },
  { to: '/reservations', label: 'Réservations',     icon: CalendarCheck,   roles: ['administrateur', 'employe', 'client'] },
  { to: '/calendrier',   label: 'Calendrier',       icon: CalendarDays,    roles: ['administrateur', 'employe'] },
  { to: '/contrats',     label: 'Contrats',         icon: FileText,        roles: ['administrateur', 'employe', 'client'] },
  { to: '/paiements',    label: 'Paiements',        icon: CreditCard,      roles: ['administrateur', 'employe', 'client'] },
  { to: '/retours',      label: 'Retours',          icon: RotateCcw,       roles: ['administrateur', 'employe'] },
  { to: '/maintenances', label: 'Maintenance',      icon: Wrench,          roles: ['administrateur', 'employe'] },
  { to: '/reclamations', label: 'Réclamations',     icon: MessageSquare,   roles: ['administrateur', 'employe', 'client'] },
  { to: '/analytique',   label: 'Analytique IA',    icon: Brain,           roles: ['administrateur', 'employe'] },
  { to: '/utilisateurs', label: 'Utilisateurs',     icon: ShieldCheck,     roles: ['administrateur'] },
]

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth()

  const visible = navItems.filter(item => item.roles.includes(user?.role))

  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black/40 z-20 lg:hidden" onClick={onClose} />
      )}

      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-slate-900 text-white z-30 flex flex-col
        transform transition-transform duration-200
        ${open ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto
      `}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <Car className="text-blue-400" size={24} />
            <span className="font-bold text-lg tracking-tight">AutoLoc</span>
          </div>
          <button onClick={onClose} className="lg:hidden text-slate-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* User info */}
        <div className="px-6 py-4 border-b border-slate-700">
          <p className="text-sm font-medium truncate">{user?.prenom} {user?.name}</p>
          <p className="text-xs text-slate-400 capitalize mt-0.5">{user?.role}</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-thin">
          {visible.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                ${isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-3 py-4 border-t border-slate-700">
          <button
            onClick={logout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <LogOut size={18} />
            Déconnexion
          </button>
        </div>
      </aside>
    </>
  )
}
