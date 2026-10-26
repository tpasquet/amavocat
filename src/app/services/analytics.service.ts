import { Injectable } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { environment } from '../environments/environment';

declare global {
  interface Window {
    umami?: {
      track: (event: string, data?: any) => void;
    };
  }
}

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private scriptLoaded = false;

  // Umami n'utilise pas de cookie : pas de consentement requis (cf. mentions légales)
  constructor(private router: Router) {
    this.initialize();
  }

  private initialize(): void {
    if (!environment.umami.enabled) {
      return;
    }

    this.loadUmamiScript();

    // Track page views automatiquement
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.trackPageView(event.urlAfterRedirects);
      });
  }

  private loadUmamiScript(): void {
    if (this.scriptLoaded || typeof document === 'undefined') {
      return;
    }

    const script = document.createElement('script');
    script.async = true;
    script.defer = true;
    script.src = environment.umami.src;
    script.setAttribute('data-website-id', environment.umami.websiteId);
    script.setAttribute('data-auto-track', 'false'); // Désactiver auto-track pour contrôler manuellement
    script.setAttribute('data-do-not-track', 'true'); // Respecter Do Not Track
    script.setAttribute('data-domains', new URL(environment.hostname).hostname);

    document.head.appendChild(script);
    this.scriptLoaded = true;
  }

  // Track une page vue
  trackPageView(url: string): void {
    if (!environment.umami.enabled || !this.scriptLoaded) {
      return;
    }

    if (window.umami) {
      window.umami.track('pageview', { url });
    }
  }

  trackEvent(eventName: string, data?: any): void {
    if (!environment.umami.enabled || !this.scriptLoaded) {
      return;
    }

    if (window.umami) {
      window.umami.track(eventName, data);
    }
  }
}
