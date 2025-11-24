import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface CookieConsent {
  analytics: boolean;
  marketing: boolean;
  timestamp: number;
}

@Injectable({
  providedIn: 'root'
})
export class CookieConsentService {
  private readonly STORAGE_KEY = 'cookie-consent';
  private consentSubject = new BehaviorSubject<CookieConsent | null>(this.getStoredConsent());

  consent$: Observable<CookieConsent | null> = this.consentSubject.asObservable();

  constructor() {
    // Charger le consentement au démarrage
    const consent = this.getStoredConsent();
    if (consent) {
      this.consentSubject.next(consent);
    }
  }

  // Vérifier si l'utilisateur a déjà donné son consentement
  hasConsent(): boolean {
    return this.getStoredConsent() !== null;
  }

  // Obtenir le consentement stocké
  getStoredConsent(): CookieConsent | null {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Error reading cookie consent:', e);
    }
    return null;
  }

  // Accepter tous les cookies
  acceptAll(): void {
    const consent: CookieConsent = {
      analytics: true,
      marketing: true,
      timestamp: Date.now()
    };
    this.saveConsent(consent);
  }

  // Refuser tous les cookies
  rejectAll(): void {
    const consent: CookieConsent = {
      analytics: false,
      marketing: false,
      timestamp: Date.now()
    };
    this.saveConsent(consent);
  }

  // Sauvegarder le consentement personnalisé
  saveConsent(consent: CookieConsent): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(consent));
      this.consentSubject.next(consent);
    } catch (e) {
      console.error('Error saving cookie consent:', e);
    }
  }

  // Révoquer le consentement
  revokeConsent(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      this.consentSubject.next(null);
    } catch (e) {
      console.error('Error revoking cookie consent:', e);
    }
  }

  // Vérifier si un type de cookie est autorisé
  isAllowed(type: 'analytics' | 'marketing'): boolean {
    const consent = this.getStoredConsent();
    return consent ? consent[type] : false;
  }
}
