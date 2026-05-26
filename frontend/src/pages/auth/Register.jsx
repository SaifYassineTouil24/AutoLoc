import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import toast from 'react-hot-toast'
import { Car } from 'lucide-react'

const schema = z.object({
  name:             z.string().min(2, 'Nom requis'),
  prenom:           z.string().optional(),
  email:            z.string().email('Email invalide'),
  telephone:        z.string().optional(),
  password:         z.string().min(8, 'Minimum 8 caractères'),
  password_confirmation: z.string(),
}).refine(d => d.password === d.password_confirmation, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['password_confirmation'],
})

export default function Register() {
  const { register: reg } = useAuth()
  const navigate = useNavigate()

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
  })

  async function onSubmit(data) {
    try {
      await reg(data)
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Erreur lors de l\'inscription')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-600 rounded-2xl mb-4">
            <Car size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Créer un compte</h1>
          <p className="text-slate-400 text-sm mt-1">Espace client AutoLoc</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Input label="Nom" placeholder="Dupont" error={errors.name?.message} {...register('name')} />
              <Input label="Prénom" placeholder="Jean" error={errors.prenom?.message} {...register('prenom')} />
            </div>
            <Input label="Email" type="email" placeholder="nom@example.com" error={errors.email?.message} {...register('email')} />
            <Input label="Téléphone" type="tel" placeholder="0555 XX XX XX" error={errors.telephone?.message} {...register('telephone')} />
            <Input label="Mot de passe" type="password" placeholder="••••••••" error={errors.password?.message} {...register('password')} />
            <Input label="Confirmer le mot de passe" type="password" placeholder="••••••••" error={errors.password_confirmation?.message} {...register('password_confirmation')} />

            <Button type="submit" className="w-full" size="lg" loading={isSubmitting}>
              Créer mon compte
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Déjà inscrit ?{' '}
            <Link to="/login" className="text-blue-600 font-medium hover:underline">Se connecter</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
