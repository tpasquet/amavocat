import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { translateTestingModule } from '../../testing/test-helpers';
import { Constants } from '../global/constant';
import { SupportedLanguages } from '../global/enum';
import { LanguageService } from './language.service';

describe('LanguageService', () => {
  let service: LanguageService;

  beforeEach(() => {
    localStorage.removeItem(Constants.LOCAL_STORAGE.LANG_KEY);
    TestBed.configureTestingModule({
      imports: [translateTestingModule],
      providers: [provideRouter([])]
    });
    service = TestBed.inject(LanguageService);
  });

  afterEach(() => localStorage.removeItem(Constants.LOCAL_STORAGE.LANG_KEY));

  it('prefers the stored language', () => {
    localStorage.setItem(Constants.LOCAL_STORAGE.LANG_KEY, 'en');
    expect(service.getPreferredLanguage()).toBe(SupportedLanguages.EN);
  });

  it('ignores an invalid stored language', () => {
    localStorage.setItem(Constants.LOCAL_STORAGE.LANG_KEY, 'de');
    expect(Object.values(SupportedLanguages)).toContain(service.getPreferredLanguage());
  });

  it('emits the new language on use()', () => {
    const emitted: SupportedLanguages[] = [];
    service.currentLang$.subscribe(lang => emitted.push(lang));

    service.use(SupportedLanguages.EN);
    service.use(SupportedLanguages.FR);

    expect(emitted.slice(-2)).toEqual([SupportedLanguages.EN, SupportedLanguages.FR]);
    expect(service.getCurrentLang()).toBe(SupportedLanguages.FR);
  });
});
