import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { TranslateLoader, TranslateModule, TranslationObject } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';
import en from '../assets/i18n/en.json';
import fr from '../assets/i18n/fr.json';

import { AppComponent } from './app.component';
import { ContactSummaryComponent } from './components/contact-summary/contact-summary.component';
import { MessageFormComponent } from './components/message-form/message-form.component';
import { Constants } from './global/constant';
import { SupportedLanguages } from './global/enum';
import { isSupportedLanguage } from './utils/language';
import { LayoutModule } from './modules/layout.module';
import { ContactComponent } from './pages/contact/contact.component';
import { HomeComponent } from './pages/home/home.component';
import { RoutingModule } from './routing/routing.module';
import { Router, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DomainsComponent } from './pages/domains/domains.component';
import { LegalComponent } from './pages/legal/legal.component';
import { PrivacyComponent } from './pages/privacy/privacy.component';
import { AccessibilityComponent } from './pages/accessibility/accessibility.component';

const TRANSLATIONS: Record<SupportedLanguages, TranslationObject> = {
  [SupportedLanguages.FR]: fr,
  [SupportedLanguages.EN]: en,
};

/**
 * Bundles the translations instead of fetching them over HTTP: they are available
 * synchronously, so prerendered pages contain their text (an async load would
 * complete after the server has serialized the page).
 */
export class BundledTranslateLoader implements TranslateLoader {
  getTranslation(lang: string): Observable<TranslationObject> {
    return of(TRANSLATIONS[isSupportedLanguage(lang) ? lang : Constants.DEFAULT_LANG]);
  }
}

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    ContactComponent,
    MessageFormComponent,
    ContactSummaryComponent,
    DomainsComponent,
    LegalComponent,
    PrivacyComponent,
    AccessibilityComponent,
  ],
  imports: [
    BrowserModule,
    CommonModule,
    HttpClientModule,
    LayoutModule,
    RouterModule,
    RoutingModule,
    ReactiveFormsModule,
    FormsModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useClass: BundledTranslateLoader
      }
    })
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
