/**
 * French UI strings, centralized so wording stays consistent and a future
 * i18n library can replace this module without touching components.
 */
export const MESSAGES = {
  app: {
    name: 'Messagerie leboncoin',
    description: 'Consultez et envoyez vos messages leboncoin.',
    logoAlt: 'leboncoin',
    section: 'Messagerie',
  },
  date: {
    today: "Aujourd'hui",
    yesterday: 'Hier',
  },
  conversations: {
    title: 'Messages',
    countLabel: 'conversations',
    loading: 'Chargement des conversations…',
    error: 'Impossible de charger vos conversations.',
    empty: 'Aucune conversation pour le moment.',
    emptyHint: 'Vos échanges avec les vendeurs et acheteurs apparaîtront ici.',
    select: 'Sélectionnez une conversation',
    selectHint: 'Choisissez une conversation dans la liste pour afficher vos messages.',
  },
  thread: {
    back: 'Retour aux conversations',
    lastMessage: 'Dernier message',
    loading: 'Chargement des messages…',
    error: 'Impossible de charger les messages.',
    empty: 'Aucun message pour le moment.',
    notFound: 'Conversation introuvable',
    notFoundHint: "Cette conversation n'existe pas ou vous n'y avez pas accès.",
    backToList: 'Voir mes conversations',
    you: 'Vous',
  },
  errors: {
    generic: 'Une erreur est survenue. Veuillez réessayer.',
    retry: 'Réessayer',
  },
} as const
