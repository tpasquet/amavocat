import { Component } from '@angular/core';
import { CookieConsentService } from '../../services/cookie-consent.service';

@Component({
    selector: 'app-cookie-button',
    templateUrl: './cookie-button.component.html',
    styleUrls: ['./cookie-button.component.scss'],
    standalone: false
})
export class CookieButtonComponent {
  isVisible = false;

  constructor(private cookieConsentService: CookieConsentService) {
    // Afficher le bouton uniquement si l'utilisateur a déjà donné son consentement
    this.isVisible = this.cookieConsentService.hasConsent();
  }

  openSettings(): void {
    // Révoquer le consentement pour réafficher la bannière
    this.cookieConsentService.revokeConsent();
    this.isVisible = false;
    // Recharger la page pour afficher la bannière
    window.location.reload();
  }
}

