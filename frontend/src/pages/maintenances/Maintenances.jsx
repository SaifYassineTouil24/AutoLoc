import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../../lib/api'
import PageHeader from '../../components/ui/PageHeader'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Badge, { statutColor, statutLabel } from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import Spinner from '../../components/ui/Spinner'
import { Table, Th, Td } from '../../components/ui/Table'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Plus, CheckCircle } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

const TYPES = ['vidange','visite_technique','vignette','pneus','freins','revision','autre']

export default function Maintenances() {
  const qc = useQueryClient()
  const [formOpen, setFormOpen]     = useState(false)
  const [terminerOpen, setTerminerOpen] = useState(null)
  const [typeFilter, setTypeFilter] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['maintenances', typeFilter],
    queryFn: () => api.get('/maintenances', { params: { type: typeFilter } }).then(r => r.data),
  })

  return (
    <div>
      <PageHeader
        title="Maintenance"
        subtitle="Planification et suivi des interventions"
        action={<Button onClick={() => setFormOpen(true)}><Plus size={16} /> Planifier</Button>}
      />

      <div className="mb-5">
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm bg-white">
          <option value="">Tous types</option>
          {TYPES.map(t => <option key={t} value={t} className="capitalize">{t.replace('_', ' ')}</option>)}
        </select>
      </div>

      {isLoading ? <Spinner /> : (
        <Table>
          <thead>
            <tr>
              <Th>Véhicule</Th><Th>Type</Th><Th>Date prévue</Th><Th>Prestataire</Th>
              <Th>Coût</Th><Th>Statut</Th><Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {data?.data?.map(m => (
              <tr key={m.id} className="hover:bg-gray-50">
                <Td>{m.vehicule?.marque} {m.vehicule?.modele} <span className="text-gray-400 text-xs">({m.vehicule?.immatriculation})</span></Td>
                <Td className="capitalize"><Badge color="blue">{m.type.replace('_', ' ')}</Badge></Td>
                <Td className="text-xs text-gray-500">{m.date_prevue ? format(new Date(m.date_prevue), 'dd/MM/yyyy', { locale: fr }) : '—'}</Td>
                <Td>{m.prestataire ?? '—'}</Td>
                <Td>{m.cout ? `${m.cout?.toLocaleString('fr-MA')} MAD` : '—'}</Td>
                <Td><Badge color={statutColor(m.statut)}>{statutLabel(m.statut)}</Badge></Td>
                <Td>
                  {(m.statut === 'planifiee' || m.statut === 'en_cours') && (
                    <button onClick={() => setTerminerOpen(m)} className="p-1.5 rounded text-gray-400 hover:text-emerald-600 hover:bg-emerald-50" title="Marquer terminée">
                      <CheckCircle size={15} />
                    </button>
                  )}
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <MaintenanceForm open={formOpen} onClose={() => setFormOpen(false)} />

      <TerminerModal open={!!terminerOpen} onClose={() => setTerminerOpen(null)} maintenance={terminerOpen} />
    </div>
  )
}

function TerminerModal({ open, onClose, maintenance }) {
  const qc = useQueryClient()
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm()

  const mutation = useMutation({
    mutationFn: d => api.post(`/maintenances/${maintenance?.id}/terminer`, d),
    onSuccess: () => {
      qc.invalidateQueries(['maintenances']); qc.invalidateQueries(['vehicules'])
      toast.success('Maintenance terminée — obligations du véhicule mises à jour')
      onClose(); reset()
    },
    onError: e => toast.error(e.response?.data?.message ?? 'Erreur'),
  })

  return (
    <Modal open={open} onClose={onClose} title={`Terminer : ${maintenance?.type?.replace('_', ' ')}`}>
      <form onSubmit={handleSubmit(d => mutation.mutate(d))} className="space-y-4">
        <Input label="Date effective *" type="date" {...register('date_effective', { required: true })} />
        <Input label="Kilométrage effectif" type="number" min="0" {...register('kilometrage_effectif', { valueAsNumber: true })} />
        <Input label="Coût réel (MAD)" type="number" min="0" {...register('cout', { valueAsNumber: true })} />
        <Input label="Prestataire" {...register('prestataire')} />
        <Input label="Réf. justificatif" {...register('justificatif')} />
        <div className="flex justify-end gap-3">
          <Button variant="secondary" type="button" onClick={onClose}>Annuler</Button>
          <Button type="submit" variant="success" loading={isSubmitting || mutation.isPending}>Marquer terminée</Button>
        </div>
      </form>
    </Modal>
  )
}

function MaintenanceForm({ open, onClose }) {
  const qc = useQueryClient()
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm()

  const vehicules = useQuery({
    queryKey: ['vehicules-list'],
    queryFn: () => api.get('/vehicules', { params: { per_page: 100 } }).then(r => r.data.data),
    enabled: open,
  })

  const mutation = useMutation({
    mutationFn: d => api.post('/maintenances', d),
    onSuccess: () => {
      qc.invalidateQueries(['maintenances'])
      toast.success('Maintenance planifiée')
      onClose(); reset()
    },
    onError: e => toast.error(e.response?.data?.message ?? 'Erreur'),
  })

  return (
    <Modal open={open} onClose={onClose} title="Planifier une maintenance">
      <form onSubmit={handleSubmit(d => mutation.mutate(d))} className="space-y-4">
        <Select label="Véhicule *" {...register('vehicule_id', { required: true, valueAsNumber: true })}>
          <option value="">Sélectionner</option>
          {vehicules.data?.map(v => <option key={v.id} value={v.id}>{v.marque} {v.modele} ({v.immatriculation})</option>)}
        </Select>
        <Select label="Type *" {...register('type', { required: true })}>
          {TYPES.map(t => <option key={t} value={t} className="capitalize">{t.replace('_', ' ')}</option>)}
        </Select>
        <Input label="Date prévue" type="date" {...register('date_prevue')} />
        <div className="grid grid-cols-2 gap-4">
          <Input label="Kilométrage de référence" type="number" min="0" {...register('kilometrage_reference', { valueAsNumber: true })} />
          <Input label="Coût estimé (MAD)" type="number" min="0" {...register('cout', { valueAsNumber: true })} />
        </div>
        <Input label="Prestataire" {...register('prestataire')} />
        <Input label="Durée d'immobilisation (jours)" type="number" min="0" {...register('duree_immobilisation_jours', { valueAsNumber: true })} />
        <Input label="Notes" {...register('notes')} />
        <div className="flex justify-end gap-3">
          <Button variant="secondary" type="button" onClick={onClose}>Annuler</Button>
          <Button type="submit" loading={isSubmitting || mutation.isPending}>Planifier</Button>
        </div>
      </form>
    </Modal>
  )
}
