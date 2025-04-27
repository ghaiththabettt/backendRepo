export interface Notification {
  _id?: string; // Identifiant unique de la notification
  titre: string; // Titre de la notification
  contenu: string; // Contenu de la notification
  utilisateurId: number; // ID de l'utilisateur destinataire
  crééPar: number; // ID de l'utilisateur qui a créé la notification
  type: 'Tâche' | 'Suivi du Temps' | 'Congé' | 'Général'; // Type de notification
  créeÀ: Date; // Date de création
  lu: boolean; // Statut de lecture
  priorité: 'Basse' | 'Normale' | 'Haute'; // Priorité de la notification
}
