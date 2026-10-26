import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AnalyticsService } from './services/analytics.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    standalone: false
})
export class AppComponent {

  constructor(
    private translate: TranslateService,
    private analyticsService: AnalyticsService // Initialise le service analytics
  ) {
    // Langues disponibles
    this.translate.addLangs(['fr', 'en']);
    // Langue par défaut (la langue active est appliquée par LanguageGuard à partir de l'URL)
    this.translate.setDefaultLang('fr');
  }
}
