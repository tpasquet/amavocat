import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, provideRouter, Router, UrlTree } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { translateTestingModule } from '../../testing/test-helpers';
import { Constants } from '../global/constant';
import { LanguageGuard } from './language.guard';

describe('LanguageGuard', () => {
  let guard: LanguageGuard;

  const routeWithLang = (lang: string) => ({ params: { lang } } as unknown as ActivatedRouteSnapshot);

  beforeEach(() => {
    localStorage.removeItem(Constants.LOCAL_STORAGE.LANG_KEY);
    TestBed.configureTestingModule({
      imports: [translateTestingModule],
      providers: [provideRouter([])]
    });
    guard = TestBed.inject(LanguageGuard);
  });

  afterEach(() => localStorage.removeItem(Constants.LOCAL_STORAGE.LANG_KEY));

  it('applies the language of the URL, whatever was stored before', () => {
    localStorage.setItem(Constants.LOCAL_STORAGE.LANG_KEY, 'fr');

    expect(guard.canActivate(routeWithLang('en'))).toBeTrue();
    expect(TestBed.inject(TranslateService).currentLang).toBe('en');
    expect(TestBed.inject(DOCUMENT).documentElement.lang).toBe('en');
    expect(localStorage.getItem(Constants.LOCAL_STORAGE.LANG_KEY)).toBe('en');
  });

  it('redirects an unsupported language to the preferred one', () => {
    localStorage.setItem(Constants.LOCAL_STORAGE.LANG_KEY, 'en');

    const result = guard.canActivate(routeWithLang('xx'));

    expect(result instanceof UrlTree).toBeTrue();
    expect(TestBed.inject(Router).serializeUrl(result as UrlTree)).toBe('/en');
  });
});
