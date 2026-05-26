import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './contexts/AuthContext'

import AppLayout from './components/layout/AppLayout'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import Dashboard from './pages/dashboard/Dashboard'
import Vehicules from './pages/vehicules/Vehicules'
import Clients from './pages/clients/Clients'
import Reservations from './pages/reservations/Reservations'
import Contrats from './pages/contrats/Contrats'
import Paiements from './pages/paiements/Paiements'
import Retours from './pages/retours/Retours'
import Maintenances from './pages/maintenances/Maintenances'
import Utilisateurs from './pages/admin/Utilisateurs'
import Analytique from './pages/analytique/Analytique'
import Calendrier from './pages/calendrier/Calendrier'
import Catalogue from './pages/catalogue/Catalogue'
import Profil from './pages/profil/Profil'
import Reclamations from './pages/reclamations/Reclamations'
import Spinner from './components/ui/Spinner'
import { ThemeProvider } from './contexts/ThemeContext'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000 },
  },
})

function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth()

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Spinner /></div>
  if (!user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />

  return children
}

function AppRoutes() {
  const { user, loading } = useAuth()

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Spinner /></div>

  return (
    <Routes>
      <Route path="/login"     element={user ? <Navigate to="/dashboard" /> : <Login />} />
      <Route path="/register"  element={user ? <Navigate to="/dashboard" /> : <Register />} />
      <Route path="/catalogue" element={<Catalogue />} />

      <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route path="/dashboard"    element={<Dashboard />} />
        <Route path="/vehicules"    element={<ProtectedRoute roles={['administrateur','employe']}><Vehicules /></ProtectedRoute>} />
        <Route path="/clients"      element={<ProtectedRoute roles={['administrateur','employe']}><Clients /></ProtectedRoute>} />
        <Route path="/reservations" element={<Reservations />} />
        <Route path="/contrats"     element={<Contrats />} />
        <Route path="/paiements"    element={<Paiements />} />
        <Route path="/retours"      element={<ProtectedRoute roles={['administrateur','employe']}><Retours /></ProtectedRoute>} />
        <Route path="/maintenances" element={<ProtectedRoute roles={['administrateur','employe']}><Maintenances /></ProtectedRoute>} />
        <Route path="/utilisateurs" element={<ProtectedRoute roles={['administrateur']}><Utilisateurs /></ProtectedRoute>} />
        <Route path="/analytique"   element={<ProtectedRoute roles={['administrateur','employe']}><Analytique /></ProtectedRoute>} />
        <Route path="/calendrier"   element={<ProtectedRoute roles={['administrateur','employe']}><Calendrier /></ProtectedRoute>} />
        <Route path="/profil"         element={<Profil />} />
        <Route path="/reclamations"   element={<Reclamations />} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ThemeProvider>
        <AuthProvider>
          <AppRoutes />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3500,
              style: { fontSize: '14px' },
              success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
              error:   { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
            }}
          />
        </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
