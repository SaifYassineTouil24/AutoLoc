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
import { Plus, Eye } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

export default function Retours() {
  const [formOpen, setFormOpen] = useState(false)
  const [detailId, setDetailId] = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ['retours'],
    queryFn: () => api.get('/retours').then(r => r.data),
  })

  const detail = useQuery({
    queryKey: ['retour', detailId],
    queryFn: () => api.get(`/retours/${detailId}`).then(r => r.data),
    enabled: !!detailId,
  })

  return (
    <div>
      <PageHeader
        title="Retours"
        subtitle="Enregistrement et inspection des retours"
        action={<Button onClick={() => setFormOpen(true)}><Plus size={16} /> Enregistrer un retour</Button>}
      />

      {isLoading ? <Spinner /> : (
        <Table>
          <thead>
            <tr>
              <Th>Contrat</Th><Th>Véhicule</Th><Th>Date retour</Th><Th>Km retour</Th>
              <Th>Dommages</Th><Th>Pénalités</Th><Th>Dépôt libéré</Th><Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {data?.data?.map(r => (
              <tr key={r.id} className="hover:bg-gray-50">
                <Td className="font-mono text-xs">{r.contrat?.numero_contrat}</Td>
                <Td>{r.contrat?.reservation?.vehicule?.marque} {r.contrat?.reservation?.vehicule?.modele}</Td>
                <Td className="text-xs text-gray-500">{format(new Date(r.date_retour_effective), 'dd/MM/yyyy HH:mm', { locale: fr })}</Td>
                <Td>{r.kilometrage_retour?.toLocaleString('fr-FR')} km</Td>
                <Td><Badge color={r.dommages_constates ? 'red' : 'green'}>{r.dommages_constates ? 'Oui' : 'Non'}</Badge></Td>
                <Td className={r.penalite_totale > 0 ? 'font-bold text-red-600' : 'text-gray-400'}>
                  {r.penalite_totale > 0 ? `${r.penalite_totale?.toLocaleString('fr-MA')} MAD` : '—'}
                </Td>
                <Td className="font-semibold text-emerald-600">{r.depot_libere?.toLocaleString('fr-MA')} MAD</Td>
                <Td>
                  <button onClick={() => setDetailId(r.id)} className="p-1.5 rounded text-gray-400 hover:text-blue-600 hover:bg-blue-50"><Eye size={15} /></button>
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <RetourForm open={formOpen} onClose={() => setFormOpen(false)} />

      <Modal open={!!detailId} onClose={() => setDetailId(null)} title="Détail du retour" size="lg">
        {detail.isLoading ? <Spinner /> : detail.data && <RetourDetail r={detail.data} />}
      </Modal>
    </div>
  )
}

function RetourDetail({ r }) {
  const penalites = [
    ['Retard', r.penalite_retard],
    ['Carburant', r.penalite_carburant],
    ['Dommages', r.penalite_dommages],
    ['Accessoires', r.penalite_accessoires],
    ['TOTAL', r.penalite_totale],
  ]
  return (
    <div className="space-y-4 text-sm">
      <div className="grid grid-cols-2 gap-3">
        {[
          ['Contrat', r.contrat?.numero_contrat],
          ['Date retour', format(new Date(r.date_retour_effective), 'dd/MM/yyyy HH:mm', { locale: fr })],
          ['Kilométrage retour', `${r.kilometrage_retour?.toLocaleString('fr-FR')} km`],
          ['Carburant retour', `${r.niveau_carburant_retour}%`],
          ['État général', r.etat_general],
          ['Dommages', r.dommages_constates ? 'Oui' : 'Non'],
          ['Dépôt libéré', `${r.depot_libere?.toLocaleString('fr-MA')} MAD`],
          ['Dépôt retenu', `${r.depot_retenu?.toLocaleString('fr-MA')} MAD`],
        ].map(([k, v]) => (
          <div key={k}><span className="text-gray-500">{k} :</span><span className="font-medium ml-1">{v}</span></div>
        ))}
      </div>
      {r.description_dommages && (
        <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
          <p className="font-medium text-red-700 mb-1">Description des dommages</p>
          <p className="text-red-600">{r.description_dommages}</p>
        </div>
      )}
      <div className="border rounded-xl overflow-hidden">
        <p className="font-semibold text-sm px-4 py-3 bg-gray-50 border-b">Détail des pénalités</p>
        {penalites.map(([k, v]) => (
          <div key={k} className={`flex justify-between px-4 py-2 text-sm ${k === 'TOTAL' ? 'font-bold bg-red-50 text-red-700' : ''}`}>
            <span>{k}</span>
            <span>{v > 0 ? `${v?.toLocaleString('fr-MA')} MAD` : '—'}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function RetourForm({ open, onClose }) {
  const qc = useQueryClient()
  const { register, handleSubmit, reset, watch, formState: { isSubmitting } } = useForm({
    defaultValues: { niveau_carburant_retour: 100, dommages_constates: false },
  })

  const contrats = useQuery({
    queryKey: ['contrats-actifs-retour'],
    queryFn: () => api.get('/contrats', { params: { statut: 'signe', per_page: 100 } }).then(r => r.data.data),
    enabled: open,
  })

  const dommages = watch('dommages_constates')

  const mutation = useMutation({
    mutationFn: d => api.post('/retours', { ...d, dommages_constates: d.dommages_constates === 'true' || d.dommages_constates === true }),
    onSuccess: () => { qc.invalidateQueries(['retours']); toast.success('Retour enregistré'); onClose(); reset() },
    onError: e => toast.error(e.response?.data?.message ?? 'Erreur'),
  })

  return (
    <Modal open={open} onClose={onClose} title="Enregistrer un retour" size="lg">
      <form onSubmit={handleSubmit(d => mutation.mutate(d))} className="space-y-4">
        <Select label="Contrat *" {...register('contrat_id', { required: true, valueAsNumber: true })}>
          <option value="">Sélectionner</option>
          {contrats.data?.map(c => (
            <option key={c.id} value={c.id}>{c.numero_contrat} — {c.reservation?.client?.user?.prenom} {c.reservation?.client?.user?.name}</option>
          ))}
        </Select>
        <Input label="Date et heure du retour *" type="datetime-local" {...register('date_retour_effective', { required: true })} />
        <div className="grid grid-cols-2 gap-4">
          <Input label="Kilométrage retour *" type="number" min="0" {...register('kilometrage_retour', { required: true, valueAsNumber: true })} />
          <Input label="Carburant retour (%)" type="number" min="0" max="100" {...register('niveau_carburant_retour', { valueAsNumber: true })} />
        </div>
        <Select label="État général *" {...register('etat_general', { required: true })}>
          {['excellent','bon','acceptable','mauvais'].map(e => <option key={e} value={e} className="capitalize">{e}</option>)}
        </Select>
        <div className="flex items-center gap-3">
          <input type="checkbox" id="dommages" className="rounded" {...register('dommages_constates')} />
          <label htmlFor="dommages" className="text-sm font-medium">Dommages constatés</label>
        </div>
        {dommages && (
          <>
            <Input label="Description des dommages" {...register('description_dommages')} />
            <Input label="Pénalité dommages (MAD)" type="number" min="0" {...register('penalite_dommages', { valueAsNumber: true })} />
          </>
        )}
        <div className="flex justify-end gap-3">
          <Button variant="secondary" type="button" onClick={onClose}>Annuler</Button>
          <Button type="submit" loading={isSubmitting || mutation.isPending}>Enregistrer</Button>
        </div>
      </form>
    </Modal>
  )
}
