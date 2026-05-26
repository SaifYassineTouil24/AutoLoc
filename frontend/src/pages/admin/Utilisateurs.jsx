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
import { Plus, UserX, Pencil } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

export default function Utilisateurs() {
  const qc = useQueryClient()
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing]   = useState(null)
  const [roleFilter, setRoleFilter] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['users', roleFilter],
    queryFn: () => api.get('/users', { params: { role: roleFilter } }).then(r => r.data),
  })

  const desactiverMut = useMutation({
    mutationFn: id => api.delete(`/users/${id}`),
    onSuccess: () => { qc.invalidateQueries(['users']); toast.success('Utilisateur désactivé') },
    onError: e => toast.error(e.response?.data?.message ?? 'Erreur'),
  })

  function openEdit(u) { setEditing(u); setFormOpen(true) }
  function openNew()   { setEditing(null); setFormOpen(true) }

  return (
    <div>
      <PageHeader
        title="Utilisateurs"
        subtitle="Gestion des accès et des rôles"
        action={<Button onClick={openNew}><Plus size={16} /> Nouvel utilisateur</Button>}
      />

      <div className="mb-5">
        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm bg-white">
          <option value="">Tous rôles</option>
          <option value="administrateur">Administrateur</option>
          <option value="employe">Employé</option>
          <option value="client">Client</option>
        </select>
      </div>

      {isLoading ? <Spinner /> : (
        <Table>
          <thead>
            <tr>
              <Th>Nom</Th><Th>Email</Th><Th>Rôle</Th><Th>Statut</Th><Th>Dernière connexion</Th><Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {data?.data?.map(u => (
              <tr key={u.id} className="hover:bg-gray-50">
                <Td className="font-medium">{u.prenom} {u.name}</Td>
                <Td className="text-gray-500">{u.email}</Td>
                <Td><Badge color={u.role === 'administrateur' ? 'purple' : u.role === 'employe' ? 'blue' : 'gray'}>{statutLabel(u.role)}</Badge></Td>
                <Td><Badge color={u.statut === 'actif' ? 'green' : u.statut === 'suspendu' ? 'orange' : 'gray'}>{u.statut}</Badge></Td>
                <Td className="text-xs text-gray-500">{u.last_login_at ? format(new Date(u.last_login_at), 'dd/MM/yyyy HH:mm', { locale: fr }) : 'Jamais'}</Td>
                <Td>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(u)} className="p-1.5 rounded text-gray-400 hover:text-amber-600 hover:bg-amber-50"><Pencil size={15} /></button>
                    {u.statut === 'actif' && (
                      <button onClick={() => desactiverMut.mutate(u.id)} className="p-1.5 rounded text-gray-400 hover:text-red-600 hover:bg-red-50" title="Désactiver">
                        <UserX size={15} />
                      </button>
                    )}
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <UserForm open={formOpen} onClose={() => setFormOpen(false)} editing={editing} />
    </div>
  )
}

function UserForm({ open, onClose, editing }) {
  const qc = useQueryClient()
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm({
    defaultValues: editing ?? {},
  })

  const mutation = useMutation({
    mutationFn: d => editing ? api.put(`/users/${editing.id}`, d) : api.post('/users', d),
    onSuccess: () => {
      qc.invalidateQueries(['users'])
      toast.success(editing ? 'Utilisateur mis à jour' : 'Utilisateur créé')
      onClose(); reset()
    },
    onError: e => toast.error(e.response?.data?.message ?? 'Erreur'),
  })

  return (
    <Modal open={open} onClose={onClose} title={editing ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}>
      <form onSubmit={handleSubmit(d => mutation.mutate(d))} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input label="Nom *" {...register('name', { required: true })} />
          <Input label="Prénom" {...register('prenom')} />
        </div>
        <Input label="Email *" type="email" {...register('email', { required: true })} />
        <Input label="Téléphone" type="tel" {...register('telephone')} />
        {!editing && (
          <Input label="Mot de passe *" type="password" {...register('password', { required: !editing, minLength: 8 })} />
        )}
        <Select label="Rôle *" {...register('role', { required: true })}>
          <option value="employe">Employé</option>
          <option value="administrateur">Administrateur</option>
          <option value="client">Client</option>
        </Select>
        {editing && (
          <Select label="Statut" {...register('statut')}>
            <option value="actif">Actif</option>
            <option value="inactif">Inactif</option>
            <option value="suspendu">Suspendu</option>
          </Select>
        )}
        <div className="flex justify-end gap-3">
          <Button variant="secondary" type="button" onClick={onClose}>Annuler</Button>
          <Button type="submit" loading={isSubmitting || mutation.isPending}>{editing ? 'Enregistrer' : 'Créer'}</Button>
        </div>
      </form>
    </Modal>
  )
}
