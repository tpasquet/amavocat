import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { Observable } from 'rxjs';

import { AppComponent } from './app.component';
import { ContactSummaryComponent } from './components/contact-summary/contact-summary.component';
import { MessageFormComponent } from './components/message-form/message-form.component';
import { PostCardComponent } from './components/post-card/post-card.component';
import { environment } from './environments/environment';
import { LayoutModule } from './modules/layout.module';
import { ContactComponent } from './pages/contact/contact.component';
import { HomeComponent } from './pages/home/home.component';
import { PostsComponent } from './pages/posts/posts.component';
import { PostDetailsComponent } from './pages/post-details/post-details.component';
import { RoutingModule } from './routing/routing.module';
import { Router, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MenuLanguageComponent } from './components/menu-language/menu-language.component';
import { DomainsComponent } from './pages/domains/domains.component';
import { LegalComponent } from './pages/legal/legal.component';
import { PrivacyComponent } from './pages/privacy/privacy.component';

export class CustomTranslateLoader implements TranslateLoader {
  constructor(private http: HttpClient) {}

  getTranslation(lang: string): Observable<any> {
    return this.http.get(`./assets/i18n/${lang}.json`);
  }
}

export function HttpLoaderFactory(http: HttpClient) {
  return new CustomTranslateLoader(http);
}

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    ContactComponent,
    MessageFormComponent,
    ContactSummaryComponent,
    PostsComponent,
    PostCardComponent,
    PostDetailsComponent,
    MenuLanguageComponent,
    DomainsComponent,
    LegalComponent,
    PrivacyComponent,
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
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    })
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
