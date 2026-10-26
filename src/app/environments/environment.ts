import { Environment } from './environment.model';

export const environment: Environment = {
  production: false,
  dev: false,
  hostname: 'http://localhost:4200',
  apiUrl: 'http://localhost:3000/api',
  umami: {
    // Désactivé en local : l'identifiant est celui de la prod, les visites locales y seraient comptées
    enabled: false,
    websiteId: 'fc57237c-ebb4-49f2-bf2b-0da03e57e157',
    src: 'https://cloud.umami.is/script.js'
  }
};
