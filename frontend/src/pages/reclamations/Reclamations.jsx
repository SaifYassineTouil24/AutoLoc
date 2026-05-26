import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Plus, Eye, MessageSquare, CheckCircle2, Clock, AlertTriangle, XCircle } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import api from '../../lib/api'
import { useAuth } from '../../contexts/AuthContext'
import PageHeader from '../../components/ui/PageHeader'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import Spinner from '../../components/ui/Spinner'
import { Table, Th, Td } from '../../components/ui/Table'
import Badge from '../../components/ui/Badge'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'

const TYPE_LABELS = { facturation: 'Facturation', vehicule: 'Véhicule', service: 'Service', retard: 'Retard', autre: 'Autre' }
const TYPE_COLORS = { facturation: 'yellow', service: 'blue', vehicule: 'red', retard: 'orange', autre: 'gray' }

const STATUT_CONFIG = {
  ouverte:       { label: 'Ouverte',       icon: AlertTriangle,  color: 'bg-red-100 text-red-700' },
  en_traitement: { label: 'En traitement', icon: Clock,          color: 'bg-blue-100 text-blue-700' },
  resolue:       { label: 'Résolue',       icon: CheckCircle2,   color: 'bg-emerald-100 text-emerald-700' },
  fermee:        { label: 'Fermée',        icon: XCircle,        color: 'bg-gray-100 text-gray-600' },
}

const PRIORITE_DOT = { haute: 'bg-red-500', normale: 'bg-blue-400', basse: 'bg-gray-300' }

function StatutBadge({ statut }) {
  const cfg = STATUT_CONFIG[statut] ?? STATUT_CONFIG.ouverte
  const Icon = cfg.icon
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${cfg.color}`}>
      <Icon size={11} /> {cfg.label}
    </span>
  )
}

export default function Reclamations() {
  const { isClient, isStaff } = useAuth()
  const qc = useQueryClient()
  const [createOpen, setCreateOpen] = useState(false)
  const [detailId, setDetailId]     = useState(null)
  const [filtreStatut, setFiltreStatut] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['reclamations', filtreStatut],
    queryFn: () => api.get('/reclamations', { params: filtreStatut ? { statut: filtreStatut } : {} }).then(r => r.data),
  })

  const detail = useQuery({
    queryKey: ['reclamation', detailId],
    queryFn:  () => api.get(`/reclamations/${detailId}`).then(r => r.data),
    enabled: !!detailId,
  })

  const rows = data?.data ?? []

  return (
    <div>
      <PageHeader
        title="Réclamations & Litiges"
        subtitle="Gestion des réclamations clients"
        action={<Button onClick={() => setCreateOpen(true)}><Plus size={16} /> Nouvelle réclamation</Button>}
      />

      {/* Filters */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {['', 'ouverte', 'en_traitement', 'resolue', 'fermee'].map(s => (
          <button
            key={s}
            onClick={() => setFiltreStatut(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
              filtreStatut === s
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-blue-300'
            }`}
          >
            {s === '' ? 'Toutes' : STATUT_CONFIG[s]?.label}
          </button>
        ))}
      </div>

      {isLoading ? <Spinner /> : (
        <Table>
          <thead>
            <tr>
              <Th>Priorité</Th><Th>Titre</Th><Th>Type</Th>
              <Th>Client</Th><Th>Statut</Th><Th>Date</Th><Th>Agent</Th><Th></Th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><Td colSpan={8} className="text-center text-gray-400 py-10">Aucune réclamation</Td></tr>
            ) : rows.map(r => (
              <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <Td>
                  <span className={`w-2.5 h-2.5 rounded-full inline-block ${PRIORITE_DOT[r.priorite]}`} title={r.priorite} />
                </Td>
                <Td className="font-medium max-w-[200px] truncate">{r.titre}</Td>
                <Td><Badge color={TYPE_COLORS[r.type] ?? 'gray'}>{TYPE_LABELS[r.type] ?? r.type}</Badge></Td>
                <Td>{r.client?.user?.prenom} {r.client?.user?.name}</Td>
                <Td><StatutBadge statut={r.statut} /></Td>
                <Td className="text-xs text-gray-500">
                  {format(new Date(r.created_at), 'dd MMM yyyy', { locale: fr })}
                </Td>
                <Td className="text-xs text-gray-500">{r.agent ? `${r.agent.prenom} ${r.agent.name}` : <span className="text-gray-300">—</span>}</Td>
                <Td>
                  <button onClick={() => setDetailId(r.id)} className="p-1.5 rounded text-gray-400 hover:text-blue-600 hover:bg-blue-50">
                    <Eye size={15} />
                  </button>
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <NouvelleReclamation open={createOpen} onClose={() => setCreateOpen(false)} />

      <Modal open={!!detailId} onClose={() => setDetailId(null)} title="Détail de la réclamation" size="xl">
        {detail.isLoading ? <Spinner /> : detail.data && (
          <ReclamationDetail
            reclamation={detail.data}
            isStaff={isStaff}
            onUpdated={() => { detail.refetch(); qc.invalidateQueries({ queryKey: ['reclamations'] }) }}
          />
        )}
      </Modal>
    </div>
  )
}

function NouvelleReclamation({ open, onClose }) {
  const qc = useQueryClient()
  const { isClient, user } = useAuth()
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm()

  const reservations = useQuery({
    queryKey: ['mes-reservations'],
    queryFn: () => api.get('/reservations', { params: { per_page: 100 } }).then(r => r.data.data),
    enabled: open,
  })

  const mutation = useMutation({
    mutationFn: d => api.post('/reclamations', d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['reclamations'] }); toast.success('Réclamation envoyée'); onClose(); reset() },
    onError: e => toast.error(e.response?.data?.message ?? 'Erreur'),
  })

  return (
    <Modal open={open} onClose={onClose} title="Nouvelle réclamation">
      <form onSubmit={handleSubmit(d => mutation.mutate(d))} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Select label="Type *" {...register('type', { required: true })}>
            {Object.entries(TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </Select>
          <Select label="Priorité" {...register('priorite')}>
            <option value="normale">Normale</option>
            <option value="haute">Haute</option>
            <option value="basse">Basse</option>
          </Select>
        </div>
        <Input label="Titre *" placeholder="Résumez votre problème en quelques mots" {...register('titre', { required: true })} />
        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Description *</label>
          <textarea
            rows={4}
            placeholder="Décrivez le problème en détail…"
            {...register('description', { required: true })}
            className="w-full px-3 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>
        <Select label="Réservation concernée (optionnel)" {...register('reservation_id', { valueAsNumber: true })}>
          <option value="">Aucune</option>
          {reservations.data?.map(r => (
            <option key={r.id} value={r.id}>{r.numero_reservation} — {r.vehicule?.marque} {r.vehicule?.modele}</option>
          ))}
        </Select>
        {!isClient && (
          <Input label="ID Client" type="number" placeholder="ID du client" {...register('client_id', { valueAsNumber: true })} />
        )}
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" type="button" onClick={onClose}>Annuler</Button>
          <Button type="submit" loading={isSubmitting || mutation.isPending}>Envoyer</Button>
        </div>
      </form>
    </Modal>
  )
}

function ReclamationDetail({ reclamation: r, isStaff, onUpdated }) {
  const { register, handleSubmit, formState: { isSubmitting } } = useForm({
    defaultValues: { reponse: r.reponse ?? '', statut: r.statut },
  })

  const mutation = useMutation({
    mutationFn: d => api.put(`/reclamations/${r.id}`, d),
    onSuccess: () => { toast.success('Réclamation mise à jour'); onUpdated() },
    onError: e => toast.error(e.response?.data?.message ?? 'Erreur'),
  })

  return (
    <div className="space-y-5">
      {/* Header info */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
        {[
          ['Type',     TYPE_LABELS[r.type] ?? r.type],
          ['Priorité', r.priorite],
          ['Statut',   <StatutBadge statut={r.statut} />],
          ['Client',   `${r.client?.user?.prenom} ${r.client?.user?.name}`],
          ['Agent',    r.agent ? `${r.agent.prenom} ${r.agent.name}` : 'Non assigné'],
          ['Date',     format(new Date(r.created_at), 'dd MMM yyyy HH:mm', { locale: fr })],
        ].map(([k, v]) => (
          <div key={k} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
            <p className="text-xs text-gray-400 mb-0.5">{k}</p>
            <p className="font-medium text-gray-800 dark:text-gray-200">{v}</p>
          </div>
        ))}
      </div>

      {/* Description */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Description</p>
        <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 rounded-xl p-4 leading-relaxed">{r.description}</p>
      </div>

      {/* Response (staff only) */}
      {isStaff && !['resolue', 'fermee'].includes(r.statut) && (
        <form onSubmit={handleSubmit(d => mutation.mutate(d))} className="space-y-3">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Répondre</p>
          <div>
            <textarea
              rows={3}
              placeholder="Votre réponse au client…"
              {...register('reponse')}
              className="w-full px-3 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
          <div className="flex items-center gap-3">
            <Select {...register('statut')} className="text-sm">
              {Object.entries(STATUT_CONFIG).map(([v, c]) => <option key={v} value={v}>{c.label}</option>)}
            </Select>
            <Button type="submit" loading={isSubmitting || mutation.isPending}>
              <MessageSquare size={14} /> Enregistrer
            </Button>
          </div>
        </form>
      )}

      {/* Existing response */}
      {r.reponse && (
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Réponse de l'agence</p>
          <p className="text-sm text-gray-700 dark:text-gray-300 bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4 leading-relaxed">{r.reponse}</p>
        </div>
      )}
    </div>
  )
}
