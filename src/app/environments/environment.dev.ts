import { Environment } from './environment.model';

export const environment: Environment = {
  production: false,
  dev: true,
  hostname: 'https://dev.aurelie-manier.fr',
  apiUrl: 'https://api-dev.aurelie-manier.fr/api',
  umami: {
    // Désactivé tant qu'un site Umami de dev n'est pas créé
    enabled: false,
    websiteId: 'YOUR_UMAMI_DEV_WEBSITE_ID', // À remplacer par votre ID de dev
    src: 'https://analytics.eu.umami.is/script.js' // Ou votre propre instance
  }
};
