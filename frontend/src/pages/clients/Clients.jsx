import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import api from '../../lib/api'
import PageHeader from '../../components/ui/PageHeader'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Card from '../../components/ui/Card'
import Badge, { statutColor, statutLabel } from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import Spinner from '../../components/ui/Spinner'
import { Table, Th, Td } from '../../components/ui/Table'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Plus, Search, Eye, RefreshCw, Star } from 'lucide-react'

function ScoreBar({ score }) {
  const color = score >= 80 ? 'bg-emerald-500' : score >= 50 ? 'bg-blue-500' : 'bg-red-500'
  return (
    <div className="flex items-center gap-2">
      <div className="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${score}%` }} />
      </div>
      <span className="text-xs font-medium">{score}</span>
    </div>
  )
}

export default function Clients() {
  const qc = useQueryClient()
  const [search, setSearch]     = useState('')
  const [segment, setSegment]   = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [detailId, setDetailId] = useState(null)
  const [searchParams] = useSearchParams()
  useEffect(() => {
    const id = searchParams.get('open')
    if (id) setDetailId(Number(id))
  }, [])

  const { data, isLoading } = useQuery({
    queryKey: ['clients', search, segment],
    queryFn: () => api.get('/clients', { params: { search, segment } }).then(r => r.data),
  })

  const scoreMut = useMutation({
    mutationFn: (id) => api.get(`/clients/${id}/score`),
    onSuccess: () => { qc.invalidateQueries(['clients']); toast.success('Score recalculé') },
  })

  const detail = useQuery({
    queryKey: ['client', detailId],
    queryFn:  () => api.get(`/clients/${detailId}`).then(r => r.data),
    enabled:  !!detailId,
  })

  return (
    <div>
      <PageHeader
        title="Clients"
        subtitle="Gestion des profils et scoring"
        action={<Button onClick={() => setFormOpen(true)}><Plus size={16} /> Nouveau client</Button>}
      />

      <Card className="p-4 mb-5">
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-48">
            <Search size={16} className="text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Nom, email, N° CNI..." className="flex-1 text-sm outline-none" />
          </div>
          <select value={segment} onChange={e => setSegment(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm">
            <option value="">Tous segments</option>
            <option value="vip">VIP</option>
            <option value="standard">Standard</option>
            <option value="risque">À risque</option>
          </select>
        </div>
      </Card>

      {isLoading ? <Spinner /> : (
        <Table>
          <thead>
            <tr>
              <Th>Client</Th><Th>Email</Th><Th>N° CNI</Th><Th>N° Permis</Th>
              <Th>Score</Th><Th>Segment</Th><Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {data?.data?.map(c => (
              <tr key={c.id} className="hover:bg-gray-50">
                <Td className="font-medium">{c.user?.prenom} {c.user?.name}</Td>
                <Td className="text-gray-500">{c.user?.email}</Td>
                <Td className="font-mono text-xs">{c.numero_cni ?? '—'}</Td>
                <Td className="font-mono text-xs">{c.numero_permis ?? '—'}</Td>
                <Td><ScoreBar score={c.score_fiabilite} /></Td>
                <Td><Badge color={statutColor(c.segment)}>{statutLabel(c.segment)}</Badge></Td>
                <Td>
                  <div className="flex gap-1">
                    <button onClick={() => setDetailId(c.id)} className="p-1.5 rounded text-gray-400 hover:text-blue-600 hover:bg-blue-50"><Eye size={15} /></button>
                    <button onClick={() => scoreMut.mutate(c.id)} className="p-1.5 rounded text-gray-400 hover:text-emerald-600 hover:bg-emerald-50" title="Recalculer le score"><RefreshCw size={15} /></button>
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <ClientForm open={formOpen} onClose={() => setFormOpen(false)} />

      <Modal open={!!detailId} onClose={() => setDetailId(null)} title="Fiche client" size="lg">
        {detail.isLoading ? <Spinner /> : detail.data && <ClientDetail client={detail.data} />}
      </Modal>
    </div>
  )
}

function ClientDetail({ client }) {
  const u = client.user
  return (
    <div className="space-y-5">
      {/* Identity */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xl font-bold">
          {(u?.prenom?.[0] ?? u?.name?.[0] ?? '?').toUpperCase()}
        </div>
        <div>
          <p className="font-semibold text-lg">{u?.prenom} {u?.name}</p>
          <p className="text-sm text-gray-500">{u?.email} · {u?.telephone ?? 'Pas de téléphone'}</p>
        </div>
        <div className="ml-auto text-right">
          <p className="text-3xl font-bold text-blue-600">{client.score_fiabilite}</p>
          <p className="text-xs text-gray-500">Score / 100</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm">
        {[
          ['N° CNI', client.numero_cni],
          ['N° Permis', client.numero_permis],
          ['Date de naissance', client.date_naissance ? new Date(client.date_naissance).toLocaleDateString('fr-FR') : null],
          ['Ville', client.ville],
          ['Adresse', client.adresse],
          ['Segment', statutLabel(client.segment)],
        ].map(([k, v]) => v ? (
          <div key={k}><span className="text-gray-500">{k} :</span> <span className="font-medium">{v}</span></div>
        ) : null)}
      </div>

      {client.reservations?.length > 0 && (
        <div>
          <p className="font-semibold text-sm mb-2">Historique des réservations ({client.reservations.length})</p>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {client.reservations.map(r => (
              <div key={r.id} className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded-lg">
                <span>{r.vehicule?.marque} {r.vehicule?.modele}</span>
                <span className="text-gray-500">{new Date(r.date_debut).toLocaleDateString('fr-FR')}</span>
                <Badge color={statutColor(r.statut)} >{statutLabel(r.statut)}</Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function ClientForm({ open, onClose }) {
  const qc = useQueryClient()
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm()

  const mutation = useMutation({
    mutationFn: (data) => api.post('/clients', data),
    onSuccess: () => {
      qc.invalidateQueries(['clients'])
      toast.success('Client créé')
      onClose(); reset()
    },
    onError: e => toast.error(e.response?.data?.message ?? 'Erreur'),
  })

  return (
    <Modal open={open} onClose={onClose} title="Nouveau client" size="lg">
      <form onSubmit={handleSubmit(d => mutation.mutate(d))} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input label="Nom *" {...register('name', { required: true })} />
          <Input label="Prénom" {...register('prenom')} />
          <Input label="Email *" type="email" {...register('email', { required: true })} />
          <Input label="Téléphone" type="tel" {...register('telephone')} />
          <Input label="Mot de passe *" type="password" {...register('password', { required: true, minLength: 8 })} />
          <Input label="N° CNI" {...register('numero_cni')} />
          <Input label="N° Permis" {...register('numero_permis')} />
          <Input label="Date de naissance" type="date" {...register('date_naissance')} />
          <Input label="Ville" {...register('ville')} className="col-span-2" />
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" type="button" onClick={onClose}>Annuler</Button>
          <Button type="submit" loading={isSubmitting || mutation.isPending}>Créer</Button>
        </div>
      </form>
    </Modal>
  )
}
