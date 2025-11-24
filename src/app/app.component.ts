import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from './services/language.service';
import { AnalyticsService } from './services/analytics.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    standalone: false
})
export class AppComponent implements OnInit {

  constructor(
    private translate: TranslateService,
    private languageService: LanguageService,
    private analyticsService: AnalyticsService // Initialise le service analytics
  ) {
    // Langues disponibles
    this.translate.addLangs(['fr', 'en']);
    // Langue par défaut
    this.translate.setDefaultLang('fr');
  }

  ngOnInit() {
    // Utiliser la langue actuelle du service
    const currentLang = this.languageService.getCurrentLang();
    this.translate.use(currentLang);
  }
}
