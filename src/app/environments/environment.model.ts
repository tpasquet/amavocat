export interface Environment {
  production: boolean;
  dev: boolean;
  hostname: string;
  apiUrl: string;
  umami: {
    enabled: boolean;
    websiteId: string;
    src: string;
  };
}
