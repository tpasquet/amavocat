import { Environment } from './environment.model';

export const environment: Environment = {
  production: true,
  dev: false,
  hostname: 'https://aureliemanier-avocat.fr',
  apiUrl: 'https://api.aureliemanier-avocat.fr/api',
  // À activer une fois l'API en ligne avec SMTP_* / CONTACT_* configurés (api/README.md)
  contactForm: false,
  umami: {
    enabled: true,
    websiteId: 'fc57237c-ebb4-49f2-bf2b-0da03e57e157',
    src: 'https://cloud.umami.is/script.js'
  }
};
