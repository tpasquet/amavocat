export interface Environment {
  production: boolean;
  dev: boolean;
  hostname: string;
  apiUrl: string;
  /** Shows the contact form; keep it off until the API and its SMTP settings are live (api/README.md) */
  contactForm: boolean;
  umami: {
    enabled: boolean;
    websiteId: string;
    src: string;
  };
}
