import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import {
  User, Mail, Phone, MapPin, Shield, KeyRound,
  Clock, CheckCircle2, AlertCircle, Eye, EyeOff,
  Pencil, Save, X,
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import api from '../../lib/api'

const ROLE_CONFIG = {
  administrateur: { label: 'Administrateur', color: 'bg-purple-100 text-purple-700 border-purple-200', dot: 'bg-purple-500' },
  employe:        { label: 'Employé',         color: 'bg-blue-100 text-blue-700 border-blue-200',     dot: 'bg-blue-500' },
  client:         { label: 'Client',          color: 'bg-emerald-100 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
}

function TabButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`px-5 py-2.5 text-sm font-medium rounded-lg transition-all ${
        active
          ? 'bg-white text-blue-700 shadow-sm border border-gray-200'
          : 'text-gray-500 hover:text-gray-800 hover:bg-white/60'
      }`}
    >
      {children}
    </button>
  )
}

function SectionTitle({ children }) {
  return (
    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">{children}</h3>
  )
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
      <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 mt-0.5">
        <Icon size={15} className="text-gray-500" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-sm font-medium text-gray-800 mt-0.5 wrap-break-word">{value ?? '—'}</p>
      </div>
    </div>
  )
}

/* ─── Profile info form ─── */
function ProfileForm({ user, onSaved }) {
  const [editing, setEditing] = useState(false)
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      prenom:      user?.prenom ?? '',
      name:        user?.name ?? '',
      email:       user?.email ?? '',
      telephone:   user?.telephone ?? '',
      adresse:     user?.client?.adresse ?? '',
      ville:       user?.client?.ville ?? '',
      code_postal: user?.client?.code_postal ?? '',
    },
  })

  const mutation = useMutation({
    mutationFn: (d) => api.put('/auth/profile', d).then(r => r.data),
    onSuccess: (data) => {
      toast.success('Profil mis à jour')
      onSaved(data.user)
      setEditing(false)
    },
    onError: (e) => toast.error(e.response?.data?.message ?? 'Erreur lors de la mise à jour'),
  })

  function cancel() {
    reset()
    setEditing(false)
  }

  return (
    <form onSubmit={handleSubmit(d => mutation.mutate(d))}>
      <div className="flex items-center justify-between mb-6">
        <SectionTitle>Informations personnelles</SectionTitle>
        {!editing ? (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            <Pencil size={14} /> Modifier
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={cancel}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <X size={14} /> Annuler
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-60 font-medium"
            >
              <Save size={14} />
              {mutation.isPending ? 'Sauvegarde…' : 'Enregistrer'}
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          { name: 'prenom', label: 'Prénom', icon: User },
          { name: 'name',   label: 'Nom',    icon: User },
          { name: 'email',  label: 'Email',  icon: Mail, type: 'email' },
          { name: 'telephone', label: 'Téléphone', icon: Phone },
        ].map(({ name, label, icon: Icon, type = 'text' }) => (
          <div key={name}>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">{label}</label>
            <div className="relative">
              <Icon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type={type}
                disabled={!editing}
                {...register(name, name === 'name' || name === 'email' ? { required: true } : {})}
                className={`w-full pl-9 pr-3 py-2.5 text-sm border rounded-xl transition-all
                  ${!editing
                    ? 'bg-gray-50 border-gray-200 text-gray-600 cursor-default'
                    : 'bg-white border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  }
                  ${errors[name] ? 'border-red-400' : ''}
                `}
              />
            </div>
            {errors[name] && <p className="text-xs text-red-500 mt-1">Ce champ est requis</p>}
          </div>
        ))}
      </div>

      {/* Client-specific fields */}
      {user?.role === 'client' && (
        <div className="mt-6">
          <SectionTitle>Adresse</SectionTitle>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Adresse</label>
              <div className="relative">
                <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  disabled={!editing}
                  {...register('adresse')}
                  placeholder="123 rue Mohammed V"
                  className={`w-full pl-9 pr-3 py-2.5 text-sm border rounded-xl ${!editing ? 'bg-gray-50 border-gray-200 text-gray-600 cursor-default' : 'bg-white border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'}`}
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Ville</label>
              <input
                disabled={!editing}
                {...register('ville')}
                placeholder="Casablanca"
                className={`w-full px-3 py-2.5 text-sm border rounded-xl ${!editing ? 'bg-gray-50 border-gray-200 text-gray-600 cursor-default' : 'bg-white border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'}`}
              />
            </div>
          </div>
        </div>
      )}

      {/* Client identity docs (read-only) */}
      {user?.role === 'client' && user?.client && (
        <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
          <SectionTitle>Documents d'identité (lecture seule)</SectionTitle>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs text-gray-400 mb-0.5">CIN</p>
              <p className="font-mono font-medium text-gray-700">{user.client.numero_cni ?? '—'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Permis de conduire</p>
              <p className="font-mono font-medium text-gray-700">{user.client.numero_permis ?? '—'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Date de naissance</p>
              <p className="font-medium text-gray-700">
                {user.client.date_naissance
                  ? new Date(user.client.date_naissance).toLocaleDateString('fr-MA')
                  : '—'}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Score fiabilité</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full ${
                      user.client.score_fiabilite >= 80 ? 'bg-emerald-500' :
                      user.client.score_fiabilite >= 50 ? 'bg-blue-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${user.client.score_fiabilite ?? 0}%` }}
                  />
                </div>
                <span className="font-semibold text-gray-700 text-xs">{user.client.score_fiabilite ?? 0}/100</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </form>
  )
}

/* ─── Password form ─── */
function PasswordForm() {
  const [show, setShow] = useState({ current: false, new: false, confirm: false })
  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm()
  const newPwd = watch('password')

  const mutation = useMutation({
    mutationFn: (d) => api.put('/auth/password', d),
    onSuccess: () => { toast.success('Mot de passe mis à jour'); reset() },
    onError: (e) => toast.error(e.response?.data?.errors?.current_password?.[0] ?? e.response?.data?.message ?? 'Erreur'),
  })

  const strength = (() => {
    if (!newPwd) return 0
    let s = 0
    if (newPwd.length >= 8)  s++
    if (/[A-Z]/.test(newPwd)) s++
    if (/[0-9]/.test(newPwd)) s++
    if (/[^A-Za-z0-9]/.test(newPwd)) s++
    return s
  })()

  const strengthLabel = ['', 'Faible', 'Moyen', 'Fort', 'Très fort'][strength]
  const strengthColor = ['', 'bg-red-400', 'bg-amber-400', 'bg-blue-400', 'bg-emerald-500'][strength]

  function PasswordField({ name, label, showKey }) {
    return (
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1.5">{label}</label>
        <div className="relative">
          <KeyRound size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type={show[showKey] ? 'text' : 'password'}
            {...register(name, {
              required: 'Ce champ est requis',
              ...(name === 'password' ? { minLength: { value: 8, message: '8 caractères minimum' } } : {}),
              ...(name === 'password_confirmation' ? {
                validate: v => v === newPwd || 'Les mots de passe ne correspondent pas',
              } : {}),
            })}
            className={`w-full pl-9 pr-10 py-2.5 text-sm border rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors[name] ? 'border-red-400' : 'border-gray-300'}`}
          />
          <button
            type="button"
            onClick={() => setShow(s => ({ ...s, [showKey]: !s[showKey] }))}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {show[showKey] ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        </div>
        {errors[name] && <p className="text-xs text-red-500 mt-1">{errors[name].message}</p>}
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(d => mutation.mutate(d))} className="space-y-5 max-w-md">
      <SectionTitle>Changer le mot de passe</SectionTitle>

      <PasswordField name="current_password" label="Mot de passe actuel" showKey="current" />
      <PasswordField name="password" label="Nouveau mot de passe" showKey="new" />

      {/* Strength bar */}
      {newPwd && (
        <div>
          <div className="flex gap-1 mb-1">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className={`h-1 flex-1 rounded-full ${i <= strength ? strengthColor : 'bg-gray-200'}`} />
            ))}
          </div>
          <p className="text-xs text-gray-400">Force : <span className="font-medium text-gray-600">{strengthLabel}</span></p>
        </div>
      )}

      <PasswordField name="password_confirmation" label="Confirmer le nouveau mot de passe" showKey="confirm" />

      <button
        type="submit"
        disabled={mutation.isPending}
        className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition-colors"
      >
        {mutation.isPending ? 'Mise à jour…' : 'Mettre à jour le mot de passe'}
      </button>
    </form>
  )
}

/* ─── Main Page ─── */
export default function Profil() {
  const { user, isAdmin, isStaff } = useAuth()
  const [searchParams] = useSearchParams()
  const [tab, setTab] = useState(searchParams.get('tab') === 'securite' ? 'securite' : 'profil')
  const [localUser, setLocalUser] = useState(user)

  useEffect(() => {
    if (searchParams.get('tab') === 'securite') setTab('securite')
  }, [searchParams])
  const qc = useQueryClient()

  function onSaved(updatedUser) {
    setLocalUser(updatedUser)
    qc.invalidateQueries({ queryKey: ['dashboard'] })
  }

  const roleCfg = ROLE_CONFIG[localUser?.role] ?? ROLE_CONFIG.client
  const initials = [localUser?.prenom?.[0], localUser?.name?.[0]].filter(Boolean).join('').toUpperCase() || '?'

  const lastLogin = localUser?.last_login_at
    ? new Date(localUser.last_login_at).toLocaleString('fr-MA', { dateStyle: 'long', timeStyle: 'short' })
    : null

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page title */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mon profil</h1>
        <p className="text-sm text-gray-500 mt-0.5">Gérez vos informations personnelles et vos paramètres de sécurité</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Left card: avatar + summary ── */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 text-center">
            {/* Avatar */}
            <div className="relative inline-block mb-4">
              <div className="w-20 h-20 rounded-2xl bg-linear-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-3xl font-bold shadow-lg mx-auto">
                {initials}
              </div>
              <span className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${roleCfg.dot}`} />
            </div>

            <h2 className="font-bold text-gray-900 text-lg">{localUser?.prenom} {localUser?.name}</h2>
            <p className="text-sm text-gray-400 mt-0.5">{localUser?.email}</p>

            <span className={`inline-flex items-center gap-1.5 mt-3 px-3 py-1 rounded-full text-xs font-semibold border ${roleCfg.color}`}>
              <Shield size={11} />
              {roleCfg.label}
            </span>

            {/* Quick stats */}
            <div className="mt-5 pt-5 border-t border-gray-100 space-y-0">
              <InfoRow icon={Mail}  label="Email"     value={localUser?.email} />
              <InfoRow icon={Phone} label="Téléphone" value={localUser?.telephone} />
              {localUser?.client?.ville && (
                <InfoRow icon={MapPin} label="Ville" value={localUser.client.ville} />
              )}
            </div>
          </div>

          {/* Account status card */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-3">
            <SectionTitle>Compte</SectionTitle>

            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Statut</span>
              <span className="flex items-center gap-1.5 font-medium text-emerald-600">
                <CheckCircle2 size={14} /> Actif
              </span>
            </div>

            {lastLogin && (
              <div className="flex items-start justify-between text-sm gap-2">
                <span className="text-gray-500 shrink-0">Dernière connexion</span>
                <span className="text-gray-700 text-right font-medium text-xs">{lastLogin}</span>
              </div>
            )}

            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Membre depuis</span>
              <span className="text-gray-700 font-medium">
                {localUser?.created_at
                  ? new Date(localUser.created_at).toLocaleDateString('fr-MA', { year: 'numeric', month: 'long' })
                  : '—'}
              </span>
            </div>

            {localUser?.role === 'client' && localUser?.client && (
              <div className="pt-3 border-t border-gray-100">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-500">Score fiabilité</span>
                  <span className={`font-bold ${
                    localUser.client.score_fiabilite >= 80 ? 'text-emerald-600' :
                    localUser.client.score_fiabilite >= 50 ? 'text-blue-600' : 'text-red-500'
                  }`}>
                    {localUser.client.score_fiabilite ?? 0} / 100
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      localUser.client.score_fiabilite >= 80 ? 'bg-emerald-500' :
                      localUser.client.score_fiabilite >= 50 ? 'bg-blue-500' : 'bg-red-400'
                    }`}
                    style={{ width: `${localUser.client.score_fiabilite ?? 0}%` }}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1 capitalize">
                  Segment : <span className="font-medium text-gray-600">{localUser.client.segment ?? '—'}</span>
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ── Right panel: tabs ── */}
        <div className="lg:col-span-2">
          {/* Tab bar */}
          <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-5">
            <TabButton active={tab === 'profil'}   onClick={() => setTab('profil')}>
              <User size={14} className="inline mr-1.5" />
              Mon profil
            </TabButton>
            <TabButton active={tab === 'securite'} onClick={() => setTab('securite')}>
              <KeyRound size={14} className="inline mr-1.5" />
              Sécurité
            </TabButton>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            {tab === 'profil' && (
              <ProfileForm user={localUser} onSaved={onSaved} />
            )}
            {tab === 'securite' && (
              <div className="space-y-8">
                <PasswordForm />

                <div className="border-t border-gray-100 pt-6">
                  <SectionTitle>Informations de connexion</SectionTitle>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock size={14} className="text-gray-400" />
                        Dernière connexion
                      </div>
                      <span className="font-medium text-gray-800">{lastLogin ?? '—'}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-2 text-gray-600">
                        <AlertCircle size={14} className="text-gray-400" />
                        Double authentification
                      </div>
                      <span className="text-amber-600 font-medium text-xs bg-amber-50 px-2 py-1 rounded-lg">
                        Non configurée
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
