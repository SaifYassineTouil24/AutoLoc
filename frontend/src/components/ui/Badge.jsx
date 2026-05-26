const variants = {
  green:  'bg-emerald-100 text-emerald-700',
  red:    'bg-red-100 text-red-700',
  yellow: 'bg-yellow-100 text-yellow-700',
  blue:   'bg-blue-100 text-blue-700',
  gray:   'bg-gray-100 text-gray-600',
  purple: 'bg-purple-100 text-purple-700',
  orange: 'bg-orange-100 text-orange-700',
}

export default function Badge({ children, color = 'gray', className = '' }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[color]} ${className}`}>
      {children}
    </span>
  )
}

// Statut → couleur
export function statutColor(statut) {
  const map = {
    disponible: 'green', loue: 'blue', en_maintenance: 'yellow', hors_service: 'red',
    confirmee: 'blue', en_attente: 'yellow', en_cours: 'green', terminee: 'gray', annulee: 'red',
    valide: 'green', en_retard: 'red', rembourse: 'purple', refuse: 'red',
    brouillon: 'gray', signe: 'blue', actif: 'green', termine: 'gray', resilie: 'red',
    vip: 'purple', standard: 'blue', risque: 'red',
    a_jour: 'green', a_prevoir: 'yellow', en_retard_oblig: 'red', non_renseigne: 'gray',
    planifiee: 'yellow', en_cours_maint: 'blue', terminee_maint: 'green', annulee_maint: 'gray',
  }
  return map[statut] ?? 'gray'
}

export function statutLabel(statut) {
  const map = {
    disponible: 'Disponible', loue: 'Loué', en_maintenance: 'Maintenance', hors_service: 'Hors service',
    confirmee: 'Confirmée', en_attente: 'En attente', en_cours: 'En cours', terminee: 'Terminée', annulee: 'Annulée',
    valide: 'Validé', en_retard: 'En retard', rembourse: 'Remboursé', refuse: 'Refusé',
    brouillon: 'Brouillon', signe: 'Signé', actif: 'Actif', termine: 'Terminé', resilie: 'Résilié',
    vip: 'VIP', standard: 'Standard', risque: 'À risque',
    a_jour: 'À jour', a_prevoir: 'À prévoir', non_renseigne: 'Non renseigné',
    planifiee: 'Planifiée', terminee_maint: 'Terminée', annulee_maint: 'Annulée',
    administrateur: 'Administrateur', employe: 'Employé', client: 'Client',
  }
  return map[statut] ?? statut
}
