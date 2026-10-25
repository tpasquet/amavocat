import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA, Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { provideRouter, Routes } from '@angular/router';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';
import en from '../assets/i18n/en.json';
import fr from '../assets/i18n/fr.json';

/** Serves the real translation files, without HTTP. */
export class StaticTranslateLoader implements TranslateLoader {
  getTranslation(lang: string) {
    return of(lang === 'en' ? en : fr);
  }
}

export const translateTestingModule = TranslateModule.forRoot({
  loader: { provide: TranslateLoader, useClass: StaticTranslateLoader }
});

/** Common providers for component tests; child components are not declared (NO_ERRORS_SCHEMA). */
export function configureComponentTest(component: Type<unknown>, routes: Routes = []) {
  return TestBed.configureTestingModule({
    declarations: [component],
    imports: [translateTestingModule, ReactiveFormsModule],
    providers: [provideRouter(routes), provideHttpClient(), provideHttpClientTesting()],
    schemas: [NO_ERRORS_SCHEMA]
  }).compileComponents();
}
