import { Component, DestroyRef, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { LanguageService } from '../../services/language.service';
import { CookieConsentService } from '../../services/cookie-consent.service';

@Component({
    selector: 'app-footer',
    templateUrl: './footer.component.html',
    styleUrls: ['./footer.component.scss'],
    standalone: false
})
export class FooterComponent implements OnInit {
  language: string = 'fr';

  constructor(
    private languageService: LanguageService,
    private router: Router,
    private cookieConsentService: CookieConsentService,
    private destroyRef: DestroyRef
  ) { }

  ngOnInit(): void {
    this.languageService.currentLang$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(lang => this.language = lang);
  }

  navigateToLegalPage(route: string[]) {
    this.router.navigate(route).then(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  openCookieSettings() {
    // Révoquer le consentement pour réafficher la bannière
    this.cookieConsentService.revokeConsent();
    // Recharger la page pour afficher la bannière
    window.location.reload();
  }

}
