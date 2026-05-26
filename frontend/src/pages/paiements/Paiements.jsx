import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../../lib/api'
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
import { Plus, AlertCircle } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

export default function Paiements() {
  const [formOpen, setFormOpen]     = useState(false)
  const [impayesOpen, setImpayesOpen] = useState(false)
  const [typeFilter, setTypeFilter] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['paiements', typeFilter],
    queryFn: () => api.get('/paiements', { params: { type: typeFilter } }).then(r => r.data),
  })

  const impayes = useQuery({
    queryKey: ['impayes'],
    queryFn: () => api.get('/paiements/impayes').then(r => r.data),
    enabled: impayesOpen,
  })

  return (
    <div>
      <PageHeader
        title="Paiements"
        subtitle="Suivi des transactions"
        action={
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setImpayesOpen(true)}><AlertCircle size={16} /> Impayés</Button>
            <Button onClick={() => setFormOpen(true)}><Plus size={16} /> Enregistrer</Button>
          </div>
        }
      />

      <Card className="p-4 mb-5">
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm">
          <option value="">Tous types</option>
          {['acompte','solde','penalite','remboursement','depot'].map(t => <option key={t} value={t} className="capitalize">{t}</option>)}
        </select>
      </Card>

      {isLoading ? <Spinner /> : (
        <Table>
          <thead>
            <tr>
              <Th>N° Facture</Th><Th>Contrat</Th><Th>Montant</Th><Th>Type</Th>
              <Th>Mode</Th><Th>Date</Th><Th>Statut</Th>
            </tr>
          </thead>
          <tbody>
            {data?.data?.map(p => (
              <tr key={p.id} className="hover:bg-gray-50">
                <Td className="font-mono text-xs">{p.numero_facture}</Td>
                <Td className="font-mono text-xs text-gray-500">{p.contrat?.numero_contrat}</Td>
                <Td className="font-bold">{p.montant?.toLocaleString('fr-MA')} MAD</Td>
                <Td className="capitalize"><Badge color={p.type === 'remboursement' ? 'purple' : 'blue'}>{p.type}</Badge></Td>
                <Td className="capitalize">{p.mode}</Td>
                <Td className="text-xs text-gray-500">{p.date_paiement ? format(new Date(p.date_paiement), 'dd/MM/yyyy', { locale: fr }) : '—'}</Td>
                <Td><Badge color={statutColor(p.statut)}>{statutLabel(p.statut)}</Badge></Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <PaiementForm open={formOpen} onClose={() => setFormOpen(false)} />

      <Modal open={impayesOpen} onClose={() => setImpayesOpen(false)} title="Contrats impayés" size="lg">
        {impayes.isLoading ? <Spinner /> : (
          <div className="space-y-3">
            {impayes.data?.length === 0 && <p className="text-gray-500 text-center py-6">Aucun impayé 🎉</p>}
            {impayes.data?.map((item, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-xl">
                <div>
                  <p className="font-semibold text-sm">{item.client?.prenom} {item.client?.name}</p>
                  <p className="text-xs text-gray-500">{item.contrat?.numero_contrat}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-red-600">{item.montant_du?.toLocaleString('fr-MA')} MAD</p>
                  <p className="text-xs text-gray-400">/ {item.prix_total?.toLocaleString('fr-MA')} MAD</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  )
}

function PaiementForm({ open, onClose }) {
  const qc = useQueryClient()
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm()

  const contrats = useQuery({
    queryKey: ['contrats-actifs'],
    queryFn: () => api.get('/contrats', { params: { statut: 'signe', per_page: 100 } }).then(r => r.data.data),
    enabled: open,
  })

  const mutation = useMutation({
    mutationFn: d => api.post('/paiements', d),
    onSuccess: () => { qc.invalidateQueries(['paiements']); toast.success('Paiement enregistré'); onClose(); reset() },
    onError: e => toast.error(e.response?.data?.message ?? 'Erreur'),
  })

  return (
    <Modal open={open} onClose={onClose} title="Enregistrer un paiement">
      <form onSubmit={handleSubmit(d => mutation.mutate(d))} className="space-y-4">
        <Select label="Contrat *" {...register('contrat_id', { required: true, valueAsNumber: true })}>
          <option value="">Sélectionner</option>
          {contrats.data?.map(c => <option key={c.id} value={c.id}>{c.numero_contrat} — {c.reservation?.client?.user?.prenom} {c.reservation?.client?.user?.name}</option>)}
        </Select>
        <Input label="Montant (MAD) *" type="number" min="0.01" step="0.01" {...register('montant', { required: true, valueAsNumber: true })} />
        <div className="grid grid-cols-2 gap-4">
          <Select label="Type *" {...register('type', { required: true })}>
            {['acompte','solde','penalite','depot','remboursement'].map(t => <option key={t} value={t} className="capitalize">{t}</option>)}
          </Select>
          <Select label="Mode *" {...register('mode', { required: true })}>
            {['carte','especes','virement','cheque'].map(m => <option key={m} value={m} className="capitalize">{m}</option>)}
          </Select>
        </div>
        <Input label="Référence transaction" {...register('reference_transaction')} />
        <Input label="Date de paiement" type="datetime-local" {...register('date_paiement')} />
        <div className="flex justify-end gap-3">
          <Button variant="secondary" type="button" onClick={onClose}>Annuler</Button>
          <Button type="submit" loading={isSubmitting || mutation.isPending}>Enregistrer</Button>
        </div>
      </form>
    </Modal>
  )
}
