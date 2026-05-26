import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import api, { downloadPdf } from '../../lib/api'
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
import { Plus, Eye, PenLine, Download } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

function useDownloadContratPdf() {
  const [loading, setLoading] = useState(null)
  async function download(contratId, numero) {
    setLoading(contratId)
    try {
      await downloadPdf(`/pdf/contrat/${contratId}`, `contrat-${numero}.pdf`)
    } catch {
      toast.error('Erreur lors du téléchargement')
    } finally {
      setLoading(null)
    }
  }
  return { download, loading }
}

export default function Contrats() {
  const qc = useQueryClient()
  const [genererOpen, setGenererOpen] = useState(false)
  const [detailId, setDetailId]       = useState(null)
  const [searchParams] = useSearchParams()
  useEffect(() => {
    const id = searchParams.get('open')
    if (id) setDetailId(Number(id))
  }, [])
  const { download, loading: pdfLoading } = useDownloadContratPdf()

  const { data, isLoading } = useQuery({
    queryKey: ['contrats'],
    queryFn: () => api.get('/contrats').then(r => r.data),
  })

  const detail = useQuery({
    queryKey: ['contrat', detailId],
    queryFn:  () => api.get(`/contrats/${detailId}`).then(r => r.data),
    enabled: !!detailId,
  })

  return (
    <div>
      <PageHeader
        title="Contrats"
        subtitle="Gestion des contrats de location"
        action={<Button onClick={() => setGenererOpen(true)}><Plus size={16} /> Générer un contrat</Button>}
      />

      {isLoading ? <Spinner /> : (
        <Table>
          <thead>
            <tr>
              <Th>N° Contrat</Th><Th>Client</Th><Th>Véhicule</Th>
              <Th>Date signature</Th><Th>Assurance</Th><Th>Statut</Th><Th>Solde dû</Th><Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {data?.data?.map(c => (
              <tr key={c.id} className="hover:bg-gray-50">
                <Td className="font-mono text-xs font-medium">{c.numero_contrat}</Td>
                <Td>{c.reservation?.client?.user?.prenom} {c.reservation?.client?.user?.name}</Td>
                <Td>{c.reservation?.vehicule?.marque} {c.reservation?.vehicule?.modele}</Td>
                <Td className="text-xs text-gray-500">
                  {c.date_signature ? format(new Date(c.date_signature), 'dd/MM/yyyy', { locale: fr }) : '—'}
                </Td>
                <Td className="capitalize">{c.assurance_type?.replace('_', ' ') ?? '—'}</Td>
                <Td><Badge color={statutColor(c.statut)}>{statutLabel(c.statut)}</Badge></Td>
                <Td className="font-semibold text-red-600">
                  {c.solde_du > 0 ? `${c.solde_du?.toLocaleString('fr-MA')} MAD` : <span className="text-emerald-600">Soldé</span>}
                </Td>
                <Td>
                  <div className="flex items-center gap-1">
                    <button onClick={() => setDetailId(c.id)} className="p-1.5 rounded text-gray-400 hover:text-blue-600 hover:bg-blue-50" title="Voir détail"><Eye size={15} /></button>
                    <button
                      onClick={() => download(c.id, c.numero_contrat)}
                      disabled={pdfLoading === c.id}
                      className="p-1.5 rounded text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 disabled:opacity-50"
                      title="Télécharger PDF"
                    >
                      <Download size={15} className={pdfLoading === c.id ? 'animate-bounce' : ''} />
                    </button>
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <GenererContrat open={genererOpen} onClose={() => setGenererOpen(false)} />

      <Modal open={!!detailId} onClose={() => setDetailId(null)} title="Détail du contrat" size="xl">
        {detail.isLoading ? <Spinner /> : detail.data && <ContratDetail contrat={detail.data} onSigned={() => { detail.refetch(); qc.invalidateQueries(['contrats']) }} />}
      </Modal>
    </div>
  )
}

function ContratDetail({ contrat: c, onSigned }) {
  const [signerOpen, setSignerOpen] = useState(false)

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 text-sm">
        {[
          ['N° Contrat', c.numero_contrat],
          ['Statut', statutLabel(c.statut)],
          ['Client', `${c.reservation?.client?.user?.prenom} ${c.reservation?.client?.user?.name}`],
          ['Véhicule', `${c.reservation?.vehicule?.marque} ${c.reservation?.vehicule?.modele}`],
          ['Km départ', `${c.kilometrage_depart?.toLocaleString('fr-FR')} km`],
          ['État départ', c.etat_depart_vehicule],
          ['Carburant départ', `${c.niveau_carburant_depart}%`],
          ['Assurance', c.assurance_type?.replace('_', ' ')],
          ['Franchise', `${c.franchise?.toLocaleString('fr-MA')} MAD`],
          ['Date signature', c.date_signature ? format(new Date(c.date_signature), 'dd/MM/yyyy HH:mm', { locale: fr }) : '—'],
        ].map(([k, v]) => (
          <div key={k}><span className="text-gray-500">{k} :</span> <span className="font-medium ml-1">{v}</span></div>
        ))}
      </div>

      {/* Paiements */}
      {c.paiements?.length > 0 && (
        <div>
          <p className="font-semibold text-sm mb-2">Paiements</p>
          <div className="space-y-1">
            {c.paiements.map(p => (
              <div key={p.id} className="flex justify-between text-sm p-2 bg-gray-50 rounded-lg">
                <span className="capitalize">{p.type} · {p.mode}</span>
                <span className="font-medium">{p.montant?.toLocaleString('fr-MA')} MAD</span>
                <Badge color={statutColor(p.statut)}>{statutLabel(p.statut)}</Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {c.statut === 'brouillon' && (
        <div className="pt-2">
          <Button onClick={() => setSignerOpen(true)} className="w-full"><PenLine size={16} /> Signer le contrat</Button>
        </div>
      )}

      <SignerModal open={signerOpen} onClose={() => setSignerOpen(false)} contratId={c.id} onSigned={() => { setSignerOpen(false); onSigned() }} />
    </div>
  )
}

function SignerModal({ open, onClose, contratId, onSigned }) {
  const { register, handleSubmit, formState: { isSubmitting } } = useForm()
  const mutation = useMutation({
    mutationFn: (d) => api.post(`/contrats/${contratId}/signer`, d),
    onSuccess: () => { toast.success('Contrat signé'); onSigned() },
    onError: e => toast.error(e.response?.data?.message ?? 'Erreur'),
  })
  return (
    <Modal open={open} onClose={onClose} title="Signer le contrat">
      <form onSubmit={handleSubmit(d => mutation.mutate(d))} className="space-y-4">
        <Input label="Signature client (prénom nom)" placeholder="Jean Dupont" {...register('signature_client', { required: true })} />
        <Input label="Signature employé (prénom nom)" placeholder="Agent AutoLoc" {...register('signature_employe', { required: true })} />
        <div className="flex justify-end gap-3">
          <Button variant="secondary" type="button" onClick={onClose}>Annuler</Button>
          <Button type="submit" loading={isSubmitting || mutation.isPending}>Signer</Button>
        </div>
      </form>
    </Modal>
  )
}

function GenererContrat({ open, onClose }) {
  const qc = useQueryClient()
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm()

  const reservations = useQuery({
    queryKey: ['reservations-confirmees'],
    queryFn: () => api.get('/reservations', { params: { statut: 'confirmee', per_page: 100 } }).then(r => r.data.data),
    enabled: open,
  })

  const mutation = useMutation({
    mutationFn: d => api.post('/contrats/generer', d),
    onSuccess: () => { qc.invalidateQueries(['contrats']); toast.success('Contrat généré'); onClose(); reset() },
    onError: e => toast.error(e.response?.data?.message ?? 'Erreur'),
  })

  return (
    <Modal open={open} onClose={onClose} title="Générer un contrat">
      <form onSubmit={handleSubmit(d => mutation.mutate(d))} className="space-y-4">
        <Select label="Réservation confirmée *" {...register('reservation_id', { required: true, valueAsNumber: true })}>
          <option value="">Sélectionner</option>
          {reservations.data?.map(r => (
            <option key={r.id} value={r.id}>{r.numero_reservation} — {r.client?.user?.prenom} {r.client?.user?.name} / {r.vehicule?.marque} {r.vehicule?.modele}</option>
          ))}
        </Select>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Kilométrage départ *" type="number" min="0" {...register('kilometrage_depart', { required: true, valueAsNumber: true })} />
          <Input label="Carburant départ (%) *" type="number" min="0" max="100" defaultValue={100} {...register('niveau_carburant_depart', { required: true, valueAsNumber: true })} />
        </div>
        <Select label="État du véhicule *" {...register('etat_depart_vehicule', { required: true })}>
          {['excellent','bon','acceptable','mauvais'].map(e => <option key={e} value={e} className="capitalize">{e}</option>)}
        </Select>
        <Select label="Assurance" {...register('assurance_type')}>
          <option value="basique">Basique</option>
          <option value="tous_risques">Tous risques</option>
          <option value="premium">Premium</option>
        </Select>
        <Input label="Franchise (MAD)" type="number" min="0" defaultValue={0} {...register('franchise', { valueAsNumber: true })} />
        <div className="flex justify-end gap-3">
          <Button variant="secondary" type="button" onClick={onClose}>Annuler</Button>
          <Button type="submit" loading={isSubmitting || mutation.isPending}>Générer</Button>
        </div>
      </form>
    </Modal>
  )
}
