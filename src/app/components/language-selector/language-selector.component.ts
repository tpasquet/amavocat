import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from 'src/app/services/language.service';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

@Component({
    selector: 'app-language-selector',
    templateUrl: './language-selector.component.html',
    styleUrls: ['./language-selector.component.scss'],
    standalone: false
})
export class LanguageSelectorComponent implements OnInit, OnDestroy {
  language: string;
  isOpen: boolean = false;
  private routerSubscription?: Subscription;
  @Output() languageChanged = new EventEmitter<string>();

  constructor(
    private languageService: LanguageService,
    private router: Router,
    private translate: TranslateService
  ) {
    this.language = this.languageService.getCurrentLang();
  }

  ngOnInit() {
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.language = this.languageService.getCurrentLang();
      });
  }

  ngOnDestroy() {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  toggleDropdown() {
    this.isOpen = !this.isOpen;
  }

  closeDropdown() {
    this.isOpen = false;
  }

  selectLanguage(lang: string) {
    if (this.language !== lang) {
      this.language = lang;
      this.onLanguageChange();
    }
    this.closeDropdown();
  }

  onLanguageChange() {
    // Changer la langue de traduction
    this.translate.use(this.language);

    // Mettre à jour le service de langue
    this.languageService.setCurrentLang(this.language);

    // Émettre l'événement de changement de langue
    this.languageChanged.emit(this.language);

    // Parse l'URL pour extraire le chemin sans la langue
    const urlSegments = this.router.url.split('/').filter(seg => seg);

    // Le premier segment est la langue, on prend le reste
    const pathWithoutLang = urlSegments.slice(1);

    // Navigation vers la nouvelle langue avec le même chemin
    if (pathWithoutLang.length > 0) {
      this.router.navigate([this.language, ...pathWithoutLang]);
    } else {
      // Page d'accueil
      this.router.navigate([this.language]);
    }
  }
}
