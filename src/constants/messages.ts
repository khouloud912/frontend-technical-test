/**
 * French UI strings, centralized so wording stays consistent and a future
 * i18n library can replace this module without touching components.
 */
export const MESSAGES = {
  app: {
    name: 'Messagerie leboncoin',
    description: 'Consultez et envoyez vos messages leboncoin.',
  },
  date: {
    today: "Aujourd'hui",
    yesterday: 'Hier',
  },
  errors: {
    generic: 'Une erreur est survenue. Veuillez réessayer.',
  },
} as const
