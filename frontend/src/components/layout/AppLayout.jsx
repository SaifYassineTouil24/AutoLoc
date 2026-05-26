import { useState, useRef, useEffect } from 'react'
import { Outlet, useLocation, Link, useNavigate } from 'react-router-dom'
import Sidebar from './Sidebar'
import { Menu, ChevronRight, LogOut, User, KeyRound, Car, Sun, Moon } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '../../contexts/ThemeContext'
import NotificationBell from '../notifications/NotificationBell'
import SearchBar from '../ui/SearchBar'

const ROUTE_META = {
  '/dashboard':    { label: 'Tableau de bord', parent: null },
  '/vehicules':    { label: 'Véhicules',        parent: '/dashboard' },
  '/clients':      { label: 'Clients',          parent: '/dashboard' },
  '/reservations': { label: 'Réservations',     parent: '/dashboard' },
  '/calendrier':   { label: 'Calendrier',       parent: '/dashboard' },
  '/contrats':     { label: 'Contrats',         parent: '/dashboard' },
  '/paiements':    { label: 'Paiements',        parent: '/dashboard' },
  '/retours':      { label: 'Retours',          parent: '/dashboard' },
  '/maintenances': { label: 'Maintenance',      parent: '/dashboard' },
  '/analytique':   { label: 'Analytique IA',    parent: '/dashboard' },
  '/utilisateurs': { label: 'Utilisateurs',     parent: '/dashboard' },
  '/profil':        { label: 'Mon profil',            parent: '/dashboard' },
  '/reclamations':  { label: 'Réclamations',          parent: '/dashboard' },
}

const ROLE_LABELS = {
  administrateur: 'Administrateur',
  employe:        'Employé',
  client:         'Client',
}

const ROLE_COLORS = {
  administrateur: 'bg-purple-100 text-purple-700',
  employe:        'bg-blue-100 text-blue-700',
  client:         'bg-emerald-100 text-emerald-700',
}

function Breadcrumb() {
  const { pathname } = useLocation()
  const current = ROUTE_META[pathname]
  if (!current) return null

  const crumbs = []
  if (current.parent) {
    crumbs.push({ path: current.parent, label: ROUTE_META[current.parent]?.label ?? 'Accueil' })
  }
  crumbs.push({ path: pathname, label: current.label })

  return (
    <nav className="flex items-center gap-1 text-sm">
      <Car size={14} className="text-blue-500 shrink-0" />
      {crumbs.map((c, i) => (
        <span key={c.path} className="flex items-center gap-1">
          {i > 0 && <ChevronRight size={13} className="text-gray-300" />}
          {i < crumbs.length - 1 ? (
            <Link to={c.path} className="text-gray-400 hover:text-blue-600 transition-colors">
              {c.label}
            </Link>
          ) : (
            <span className="font-semibold text-gray-800">{c.label}</span>
          )}
        </span>
      ))}
    </nav>
  )
}

function UserMenu({ user, logout }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const initials = [user?.prenom?.[0], user?.name?.[0]]
    .filter(Boolean).join('').toUpperCase() || '?'

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2.5 pl-3 pr-2 py-1.5 rounded-xl hover:bg-gray-100 transition-colors group"
      >
        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-linear-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-sm font-bold shrink-0 shadow-sm">
          {initials}
        </div>

        {/* Name + role */}
        <div className="hidden sm:block text-left">
          <p className="text-sm font-semibold text-gray-800 leading-tight">
            {user?.prenom} {user?.name}
          </p>
          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${ROLE_COLORS[user?.role] ?? 'bg-gray-100 text-gray-500'}`}>
            {ROLE_LABELS[user?.role] ?? user?.role}
          </span>
        </div>

        {/* Chevron */}
        <ChevronRight
          size={14}
          className={`text-gray-400 transition-transform duration-150 ${open ? 'rotate-90' : ''}`}
        />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-xl border border-gray-200 z-50 py-1 overflow-hidden">
          {/* User info header */}
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-semibold text-gray-900">{user?.prenom} {user?.name}</p>
            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
          </div>

          {/* Menu items */}
          <div className="py-1">
            <button
              onClick={() => { setOpen(false); navigate('/profil') }}
              className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <User size={15} className="text-gray-400" />
              Mon profil
            </button>
            <button
              onClick={() => { setOpen(false); navigate('/profil?tab=securite') }}
              className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <KeyRound size={15} className="text-gray-400" />
              Changer mot de passe
            </button>
          </div>

          <div className="border-t border-gray-100 py-1">
            <button
              onClick={() => { setOpen(false); logout() }}
              className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut size={15} />
              Déconnexion
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, logout } = useAuth()
  const { dark, toggle } = useTheme()

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center px-4 lg:px-6 shrink-0 gap-3">

          {/* Left: hamburger + breadcrumb */}
          <div className="flex items-center gap-3 shrink-0 w-52">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 shrink-0"
            >
              <Menu size={20} />
            </button>
            <div className="lg:hidden font-semibold text-gray-800 dark:text-gray-100">AutoLoc</div>
            <div className="hidden lg:block">
              <Breadcrumb />
            </div>
          </div>

          {/* Center: search bar */}
          <div className="flex-1 flex justify-center">
            <SearchBar />
          </div>

          {/* Right: theme + bell + user */}
          <div className="flex items-center gap-2 shrink-0 w-52 justify-end">
            <button
              onClick={toggle}
              className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title={dark ? 'Mode clair' : 'Mode sombre'}
            >
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <NotificationBell />
            <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />
            <UserMenu user={user} logout={logout} />
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
