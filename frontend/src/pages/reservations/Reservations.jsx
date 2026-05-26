import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import api from '../../lib/api'
import { useAuth } from '../../contexts/AuthContext'
import PageHeader from '../../components/ui/PageHeader'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Card from '../../components/ui/Card'
import Badge, { statutColor, statutLabel } from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import Spinner from '../../components/ui/Spinner'
import { Table, Th, Td } from '../../components/ui/Table'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Plus, CheckCircle, XCircle, Eye } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

export default function Reservations() {
  const { isStaff, isClient } = useAuth()
  const qc = useQueryClient()
  const [statFilter, setStatFilter] = useState('')
  const [formOpen, setFormOpen]     = useState(false)
  const [detailId, setDetailId]     = useState(null)
  const [searchParams] = useSearchParams()
  useEffect(() => {
    const id = searchParams.get('open')
    if (id) setDetailId(Number(id))
  }, [])

  const { data, isLoading } = useQuery({
    queryKey: ['reservations', statFilter],
    queryFn: () => api.get('/reservations', { params: { statut: statFilter } }).then(r => r.data),
  })

  const confirmerMut = useMutation({
    mutationFn: id => api.post(`/reservations/${id}/confirmer`),
    onSuccess: () => { qc.invalidateQueries(['reservations']); toast.success('Réservation confirmée') },
    onError: e => toast.error(e.response?.data?.message ?? 'Erreur'),
  })

  const annulerMut = useMutation({
    mutationFn: id => api.post(`/reservations/${id}/annuler`),
    onSuccess: (res) => {
      qc.invalidateQueries(['reservations'])
      const frais = res.data?.frais_annulation
      toast.success(frais > 0 ? `Annulée. Frais : ${frais.toLocaleString('fr-MA')} MAD` : 'Réservation annulée')
    },
    onError: e => toast.error(e.response?.data?.message ?? 'Erreur'),
  })

  const detail = useQuery({
    queryKey: ['reservation', detailId],
    queryFn:  () => api.get(`/reservations/${detailId}`).then(r => r.data),
    enabled:  !!detailId,
  })

  return (
    <div>
      <PageHeader
        title="Réservations"
        subtitle="Suivi et gestion des réservations"
        action={<Button onClick={() => setFormOpen(true)}><Plus size={16} /> Nouvelle réservation</Button>}
      />

      <Card className="p-4 mb-5">
        <div className="flex flex-wrap gap-3">
          <select value={statFilter} onChange={e => setStatFilter(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm">
            <option value="">Tous statuts</option>
            {['en_attente','confirmee','en_cours','terminee','annulee'].map(s => (
              <option key={s} value={s}>{statutLabel(s)}</option>
            ))}
          </select>
        </div>
      </Card>

      {isLoading ? <Spinner /> : (
        <Table>
          <thead>
            <tr>
              <Th>N° Réservation</Th><Th>Client</Th><Th>Véhicule</Th>
              <Th>Période</Th><Th>Prix total</Th><Th>Statut</Th><Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {data?.data?.map(r => (
              <tr key={r.id} className="hover:bg-gray-50">
                <Td className="font-mono text-xs font-medium">{r.numero_reservation}</Td>
                <Td>{r.client?.user?.prenom} {r.client?.user?.name}</Td>
                <Td>{r.vehicule?.marque} {r.vehicule?.modele}</Td>
                <Td className="text-xs text-gray-500">
                  {format(new Date(r.date_debut), 'dd/MM/yy', { locale: fr })} → {format(new Date(r.date_fin), 'dd/MM/yy', { locale: fr })}
                </Td>
                <Td className="font-semibold">{r.prix_total?.toLocaleString('fr-MA')} MAD</Td>
                <Td><Badge color={statutColor(r.statut)}>{statutLabel(r.statut)}</Badge></Td>
                <Td>
                  <div className="flex gap-1">
                    <button onClick={() => setDetailId(r.id)} className="p-1.5 rounded text-gray-400 hover:text-blue-600 hover:bg-blue-50"><Eye size={15} /></button>
                    {isStaff && r.statut === 'en_attente' && (
                      <button onClick={() => confirmerMut.mutate(r.id)} className="p-1.5 rounded text-gray-400 hover:text-emerald-600 hover:bg-emerald-50" title="Confirmer">
                        <CheckCircle size={15} />
                      </button>
                    )}
                    {r.statut !== 'terminee' && r.statut !== 'annulee' && (
                      <button onClick={() => annulerMut.mutate(r.id)} className="p-1.5 rounded text-gray-400 hover:text-red-600 hover:bg-red-50" title="Annuler">
                        <XCircle size={15} />
                      </button>
                    )}
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <ReservationForm open={formOpen} onClose={() => setFormOpen(false)} />

      <Modal open={!!detailId} onClose={() => setDetailId(null)} title="Détail de la réservation" size="lg">
        {detail.isLoading ? <Spinner /> : detail.data && <ReservationDetail r={detail.data} />}
      </Modal>
    </div>
  )
}

function ReservationDetail({ r }) {
  return (
    <div className="space-y-4 text-sm">
      <div className="grid grid-cols-2 gap-3">
        {[
          ['N° Réservation', r.numero_reservation],
          ['Statut', statutLabel(r.statut)],
          ['Client', `${r.client?.user?.prenom} ${r.client?.user?.name}`],
          ['Email', r.client?.user?.email],
          ['Véhicule', `${r.vehicule?.marque} ${r.vehicule?.modele} (${r.vehicule?.immatriculation})`],
          ['Date début', format(new Date(r.date_debut), 'dd/MM/yyyy HH:mm', { locale: fr })],
          ['Date fin', format(new Date(r.date_fin), 'dd/MM/yyyy HH:mm', { locale: fr })],
          ['Durée', `${r.date_debut && r.date_fin ? Math.max(1, Math.ceil((new Date(r.date_fin) - new Date(r.date_debut)) / 86400000)) : '—'} jour(s)`],
          ['Prix total', `${r.prix_total?.toLocaleString('fr-MA')} MAD`],
          ['Remise', r.remise > 0 ? `${r.remise?.toLocaleString('fr-MA')} MAD` : '—'],
          ['Lieu de prise en charge', r.lieu_prise_en_charge ?? '—'],
          ['Mode de paiement', r.mode_paiement ?? '—'],
          ['Source', r.source],
        ].map(([k, v]) => (
          <div key={k}><span className="text-gray-500">{k} :</span> <span className="font-medium ml-1">{v}</span></div>
        ))}
      </div>
      {r.notes && <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">{r.notes}</p>}
    </div>
  )
}

function ReservationForm({ open, onClose }) {
  const qc = useQueryClient()
  const { register, handleSubmit, reset, watch, formState: { isSubmitting } } = useForm()

  const clients  = useQuery({ queryKey: ['clients-list'],  queryFn: () => api.get('/clients', { params: { per_page: 100 } }).then(r => r.data.data), enabled: open })
  const vehicules = useQuery({ queryKey: ['vehicules-list'], queryFn: () => api.get('/vehicules', { params: { statut: 'disponible', per_page: 100 } }).then(r => r.data.data), enabled: open })

  const dateDebut = watch('date_debut')
  const dateFin   = watch('date_fin')
  const vehiculeId = watch('vehicule_id')
  const vehicule = vehicules.data?.find(v => v.id === +vehiculeId)

  const jours      = dateDebut && dateFin ? Math.max(1, Math.ceil((new Date(dateFin) - new Date(dateDebut)) / 86400000)) : 0
  const prixEstime = vehicule && jours > 0 ? vehicule.tarif_journalier * jours : 0

  const mutation = useMutation({
    mutationFn: (data) => api.post('/reservations', data),
    onSuccess: () => {
      qc.invalidateQueries(['reservations'])
      toast.success('Réservation créée')
      onClose(); reset()
    },
    onError: e => toast.error(e.response?.data?.message ?? 'Erreur'),
  })

  return (
    <Modal open={open} onClose={onClose} title="Nouvelle réservation" size="lg">
      <form onSubmit={handleSubmit(d => mutation.mutate(d))} className="space-y-4">
        <Select label="Client *" {...register('client_id', { required: true, valueAsNumber: true })}>
          <option value="">Sélectionner un client</option>
          {clients.data?.map(c => <option key={c.id} value={c.id}>{c.user?.prenom} {c.user?.name}</option>)}
        </Select>

        <Select label="Véhicule *" {...register('vehicule_id', { required: true })}>
          <option value="">Sélectionner un véhicule</option>
          {vehicules.data?.map(v => (
            <option key={v.id} value={v.id}>{v.marque} {v.modele} ({v.immatriculation}) — {v.tarif_journalier?.toLocaleString('fr-MA')} MAD/j</option>
          ))}
        </Select>

        <div className="grid grid-cols-2 gap-4">
          <Input label="Date de début *" type="datetime-local" {...register('date_debut', { required: true })} />
          <Input label="Date de fin *"   type="datetime-local" {...register('date_fin', { required: true })} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input label="Lieu de prise en charge" {...register('lieu_prise_en_charge')} />
          <Input label="Remise (MAD)" type="number" min="0" {...register('remise', { valueAsNumber: true })} />
        </div>

        <Select label="Mode de paiement" {...register('mode_paiement')}>
          <option value="">Sélectionner</option>
          {['carte','especes','virement','cheque'].map(m => <option key={m} value={m} className="capitalize">{m}</option>)}
        </Select>

        {prixEstime > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm">
            <p className="text-blue-700 font-medium">Estimation : {jours} jour(s) × {vehicule?.tarif_journalier?.toLocaleString('fr-MA')} MAD = <span className="text-lg font-bold">{prixEstime.toLocaleString('fr-MA')} MAD</span></p>
          </div>
        )}

        <div className="flex justify-end gap-3">
          <Button variant="secondary" type="button" onClick={onClose}>Annuler</Button>
          <Button type="submit" loading={isSubmitting || mutation.isPending}>Créer</Button>
        </div>
      </form>
    </Modal>
  )
}
