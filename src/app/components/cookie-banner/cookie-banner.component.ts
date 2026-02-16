import { Component } from '@angular/core';
import { CookieConsentService } from '../../services/cookie-consent.service';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-cookie-banner',
  templateUrl: './cookie-banner.component.html',
  styleUrls: ['./cookie-banner.component.scss'],
  standalone: false
})
export class CookieBannerComponent {
  isVisible = false;

  constructor(
    private cookieConsentService: CookieConsentService,
    private languageService: LanguageService
  ) {
    // this.isVisible = !this.cookieConsentService.hasConsent();
  }

  get language(): string {
    return this.languageService.getCurrentLang();
  }

  acceptAll(): void {
    this.cookieConsentService.acceptAll();
    this.isVisible = false;
  }

  rejectAll(): void {
    this.cookieConsentService.rejectAll();
    this.isVisible = false;
  }
}
