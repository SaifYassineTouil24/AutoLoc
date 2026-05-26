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
import { Plus, Search, Eye, Pencil, Trash2, AlertTriangle } from 'lucide-react'

const CATEGORIES = ['economique','compacte','berline','suv','utilitaire','luxe','cabriolet']

function ObligationBadge({ statut, label }) {
  const colors = { a_jour: 'green', a_prevoir: 'yellow', en_retard: 'red', non_renseigne: 'gray' }
  return <Badge color={colors[statut] ?? 'gray'}>{label}</Badge>
}

export default function Vehicules() {
  const { isStaff } = useAuth()
  const qc = useQueryClient()
  const [search, setSearch]   = useState('')
  const [catFilter, setCat]   = useState('')
  const [statFilter, setStat] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing]   = useState(null)
  const [detailId, setDetailId] = useState(null)
  const [searchParams] = useSearchParams()
  useEffect(() => {
    const id = searchParams.get('open')
    if (id) setDetailId(Number(id))
  }, [])

  const { data, isLoading } = useQuery({
    queryKey: ['vehicules', search, catFilter, statFilter],
    queryFn: () => api.get('/vehicules', { params: { marque: search, categorie: catFilter, statut: statFilter } }).then(r => r.data),
  })

  const deleteMut = useMutation({
    mutationFn: (id) => api.delete(`/vehicules/${id}`),
    onSuccess: () => { qc.invalidateQueries(['vehicules']); toast.success('Véhicule supprimé') },
    onError: (e) => toast.error(e.response?.data?.message ?? 'Erreur'),
  })

  function openEdit(v) { setEditing(v); setFormOpen(true) }
  function openNew()   { setEditing(null); setFormOpen(true) }

  const vehiculeDetail = useQuery({
    queryKey: ['vehicule', detailId],
    queryFn:  () => api.get(`/vehicules/${detailId}`).then(r => r.data),
    enabled:  !!detailId,
  })

  return (
    <div>
      <PageHeader
        title="Véhicules"
        subtitle="Gestion du parc automobile"
        action={isStaff && <Button onClick={openNew}><Plus size={16} /> Ajouter</Button>}
      />

      {/* Filtres */}
      <Card className="p-4 mb-5">
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-48">
            <Search size={16} className="text-gray-400" />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Marque, modèle..."
              className="flex-1 text-sm outline-none"
            />
          </div>
          <select value={catFilter} onChange={e => setCat(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm">
            <option value="">Toutes catégories</option>
            {CATEGORIES.map(c => <option key={c} value={c} className="capitalize">{c}</option>)}
          </select>
          <select value={statFilter} onChange={e => setStat(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm">
            <option value="">Tous statuts</option>
            {['disponible','loue','en_maintenance','hors_service'].map(s => (
              <option key={s} value={s}>{statutLabel(s)}</option>
            ))}
          </select>
        </div>
      </Card>

      {isLoading ? <Spinner /> : (
        <Table>
          <thead>
            <tr>
              <Th>Immatriculation</Th><Th>Véhicule</Th><Th>Catégorie</Th>
              <Th>Kilométrage</Th><Th>Tarif/jour</Th><Th>Statut</Th><Th>Obligations</Th>
              {isStaff && <Th>Actions</Th>}
            </tr>
          </thead>
          <tbody>
            {data?.data?.map(v => (
              <tr key={v.id} className="hover:bg-gray-50 transition-colors">
                <Td className="font-mono font-medium">{v.immatriculation}</Td>
                <Td>{v.marque} {v.modele} <span className="text-gray-400">({v.annee})</span></Td>
                <Td className="capitalize">{v.categorie}</Td>
                <Td>{v.kilometrage?.toLocaleString('fr-FR')} km</Td>
                <Td className="font-semibold">{v.tarif_journalier?.toLocaleString('fr-MA')} MAD</Td>
                <Td><Badge color={statutColor(v.statut)}>{statutLabel(v.statut)}</Badge></Td>
                <Td>
                  <div className="flex gap-1 flex-wrap">
                    {v.obligations && Object.entries(v.obligations).map(([k, s]) => (
                      <ObligationBadge key={k} statut={s} label={k.replace('_', ' ')} />
                    ))}
                  </div>
                </Td>
                {isStaff && (
                  <Td>
                    <div className="flex gap-1">
                      <button onClick={() => setDetailId(v.id)} className="p-1.5 rounded text-gray-400 hover:text-blue-600 hover:bg-blue-50"><Eye size={15} /></button>
                      <button onClick={() => openEdit(v)} className="p-1.5 rounded text-gray-400 hover:text-amber-600 hover:bg-amber-50"><Pencil size={15} /></button>
                      <button onClick={() => deleteMut.mutate(v.id)} className="p-1.5 rounded text-gray-400 hover:text-red-600 hover:bg-red-50"><Trash2 size={15} /></button>
                    </div>
                  </Td>
                )}
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {/* Pagination */}
      {data && data.last_page > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {Array.from({ length: data.last_page }, (_, i) => (
            <button key={i} className={`w-8 h-8 rounded-lg text-sm ${data.current_page === i+1 ? 'bg-blue-600 text-white' : 'bg-white border text-gray-600 hover:bg-gray-50'}`}>
              {i+1}
            </button>
          ))}
        </div>
      )}

      {/* Modal formulaire */}
      <VehiculeForm open={formOpen} onClose={() => setFormOpen(false)} editing={editing} />

      {/* Modal détail */}
      <Modal open={!!detailId} onClose={() => setDetailId(null)} title="Détail du véhicule" size="lg">
        {vehiculeDetail.isLoading ? <Spinner /> : vehiculeDetail.data && (
          <VehiculeDetail v={vehiculeDetail.data} />
        )}
      </Modal>
    </div>
  )
}

function VehiculeDetail({ v }) {
  const obligLabels = { vidange: 'Vidange', visite_technique: 'Visite technique', vignette: 'Vignette' }
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 text-sm">
        {[
          ['Immatriculation', v.immatriculation],
          ['Marque / Modèle', `${v.marque} ${v.modele}`],
          ['Année', v.annee],
          ['Couleur', v.couleur],
          ['Catégorie', v.categorie],
          ['Kilométrage', `${v.kilometrage?.toLocaleString('fr-FR')} km`],
          ['Tarif journalier', `${v.tarif_journalier?.toLocaleString('fr-MA')} MAD`],
          ['Dépôt de garantie', `${v.depot_garantie?.toLocaleString('fr-MA')} MAD`],
          ['Statut', statutLabel(v.statut)],
          ['Places', v.nombre_places],
        ].map(([k, val]) => (
          <div key={k}>
            <span className="text-gray-500">{k} :</span>
            <span className="ml-2 font-medium">{val ?? '—'}</span>
          </div>
        ))}
      </div>

      {v.obligations && (
        <div>
          <p className="font-semibold text-sm mb-2 flex items-center gap-1"><AlertTriangle size={14} /> Obligations</p>
          <div className="grid grid-cols-3 gap-3">
            {Object.entries(v.obligations).map(([k, s]) => (
              <div key={k} className="border rounded-lg p-3 text-center">
                <p className="text-xs text-gray-500 mb-1 capitalize">{obligLabels[k] ?? k}</p>
                <Badge color={{ a_jour: 'green', a_prevoir: 'yellow', en_retard: 'red', non_renseigne: 'gray' }[s] ?? 'gray'}>
                  {s === 'a_jour' ? 'À jour' : s === 'a_prevoir' ? 'À prévoir' : s === 'en_retard' ? 'En retard' : 'Non renseigné'}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function VehiculeForm({ open, onClose, editing }) {
  const qc = useQueryClient()
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    defaultValues: editing ?? {},
  })

  const mutation = useMutation({
    mutationFn: (data) => editing
      ? api.put(`/vehicules/${editing.id}`, data)
      : api.post('/vehicules', data),
    onSuccess: () => {
      qc.invalidateQueries(['vehicules'])
      toast.success(editing ? 'Véhicule mis à jour' : 'Véhicule ajouté')
      onClose()
      reset()
    },
    onError: (e) => toast.error(e.response?.data?.message ?? 'Erreur'),
  })

  return (
    <Modal open={open} onClose={onClose} title={editing ? 'Modifier le véhicule' : 'Ajouter un véhicule'} size="lg">
      <form onSubmit={handleSubmit(d => mutation.mutate(d))} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          {!editing && (
            <Input label="Immatriculation *" placeholder="16-012-001" error={errors.immatriculation?.message} {...register('immatriculation', { required: true })} />
          )}
          <Input label="Marque *" placeholder="Renault" {...register('marque', { required: true })} />
          <Input label="Modèle *" placeholder="Clio" {...register('modele', { required: true })} />
          <Input label="Année *" type="number" min="1990" max="2026" {...register('annee', { required: true, valueAsNumber: true })} />
          <Input label="Couleur" placeholder="Blanc" {...register('couleur')} />
          <Select label="Catégorie *" {...register('categorie', { required: true })}>
            {CATEGORIES.map(c => <option key={c} value={c} className="capitalize">{c}</option>)}
          </Select>
          <Input label="Kilométrage" type="number" min="0" {...register('kilometrage', { valueAsNumber: true })} />
          <Input label="Tarif journalier (MAD) *" type="number" min="0" {...register('tarif_journalier', { required: true, valueAsNumber: true })} />
          <Input label="Dépôt de garantie (MAD)" type="number" min="0" {...register('depot_garantie', { valueAsNumber: true })} />
          <Input label="Nombre de places" type="number" min="1" max="9" {...register('nombre_places', { valueAsNumber: true })} />
        </div>

        <div className="border-t pt-4">
          <p className="text-sm font-semibold text-gray-700 mb-3">Obligations</p>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Prochaine vidange (km)" type="number" {...register('prochaine_vidange_km', { valueAsNumber: true })} />
            <Input label="Prochaine visite technique" type="date" {...register('prochaine_visite_technique_date')} />
            <Input label="Dernière visite technique" type="date" {...register('derniere_visite_technique_date')} />
            <Input label="Expiration assurance" type="date" {...register('date_assurance')} />
            <Input label="Vignette année" type="number" {...register('vignette_annee', { valueAsNumber: true })} />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" type="button" onClick={onClose}>Annuler</Button>
          <Button type="submit" loading={isSubmitting || mutation.isPending}>
            {editing ? 'Enregistrer' : 'Ajouter'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
