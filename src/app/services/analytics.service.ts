import { Injectable } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { environment } from '../environments/environment';
import { CookieConsentService } from './cookie-consent.service';

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

  constructor(
    private router: Router,
    private cookieConsentService: CookieConsentService
  ) {
    this.initialize();
  }

  private initialize(): void {
    if (!environment.umami.enabled) {
      console.log('Analytics disabled in this environment');
      return;
    }

    // Vérifier le consentement avant de charger
    this.cookieConsentService.consent$.subscribe(consent => {
      if (consent?.analytics && !this.scriptLoaded) {
        this.loadUmamiScript();
      }
    });

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

    console.log('Umami Analytics loaded');
  }

  // Track une page vue
  trackPageView(url: string): void {
    if (!this.canTrack()) {
      return;
    }

    // Umami track automatiquement les pages, mais on peut le faire manuellement
    if (window.umami) {
      window.umami.track('pageview', { url });
    }
  }

  // Track un événement personnalisé
  trackEvent(eventName: string, data?: any): void {
    if (!this.canTrack()) {
      return;
    }

    if (window.umami) {
      window.umami.track(eventName, data);
    }
  }

  // Vérifier si on peut tracker
  private canTrack(): boolean {
    const consent = this.cookieConsentService.getStoredConsent();
    return environment.umami.enabled && 
           this.scriptLoaded && 
           consent?.analytics === true;
  }
}
