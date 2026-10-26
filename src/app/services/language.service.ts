import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Constants } from '../global/constant';
import { SupportedLanguages } from '../global/enum';
import { isSupportedLanguage } from '../utils/language';

/**
 * The URL (`/:lang/...`) is the single source of truth for the language.
 * `LanguageGuard` calls `use()` with the route param before any page is activated;
 * the stored/browser language is only used to pick a redirect target from `/`.
 */
@Injectable({
    providedIn: 'root'
})
export class LanguageService {
    private readonly currentLangSubject: BehaviorSubject<SupportedLanguages>;
    readonly currentLang$: Observable<SupportedLanguages>;

    constructor(
        private router: Router,
        private translate: TranslateService,
        @Inject(DOCUMENT) private document: Document,
        @Inject(PLATFORM_ID) private platformId: object
    ) {
        this.currentLangSubject = new BehaviorSubject(this.getPreferredLanguage());
        this.currentLang$ = this.currentLangSubject.asObservable();
    }

    /** Language to redirect to when the URL has none: stored choice, then browser, then default. */
    getPreferredLanguage(): SupportedLanguages {
        const stored = this.getLanguageFromLocalStorage();
        if (isSupportedLanguage(stored)) {
            return stored;
        }
        const browserLang = this.getBrowserLanguage();
        if (isSupportedLanguage(browserLang)) {
            return browserLang;
        }
        return Constants.DEFAULT_LANG;
    }

    getCurrentLang(): SupportedLanguages {
        return this.currentLangSubject.value;
    }

    /** Applies a language to the whole app: translations, `<html lang>`, and the stored preference. */
    use(lang: SupportedLanguages): void {
        this.translate.use(lang);
        this.document.documentElement.lang = lang;
        this.storeLanguage(lang);
        if (lang !== this.currentLangSubject.value) {
            this.currentLangSubject.next(lang);
        }
    }

    /** Navigates to the same page in another language; `LanguageGuard` then applies it. */
    switchTo(lang: SupportedLanguages): Promise<boolean> {
        const pathWithoutLang = this.router.url.split(/[?#]/)[0].split('/').filter(seg => seg).slice(1);
        return this.router.navigate([lang, ...pathWithoutLang]);
    }

    private getBrowserLanguage(): string | null {
        // Node also defines `navigator`: only the visitor's browser language is meaningful
        if (!isPlatformBrowser(this.platformId)) {
            return null;
        }
        // "en-US" -> "en"
        return navigator.language?.slice(0, 2) ?? null;
    }

    private getLanguageFromLocalStorage(): string | null {
        if (!isPlatformBrowser(this.platformId)) {
            return null;
        }
        try {
            return localStorage.getItem(Constants.LOCAL_STORAGE.LANG_KEY);
        } catch {
            return null;
        }
    }

    private storeLanguage(lang: SupportedLanguages): void {
        if (!isPlatformBrowser(this.platformId)) {
            return;
        }
        try {
            localStorage.setItem(Constants.LOCAL_STORAGE.LANG_KEY, lang);
        } catch {
            // Storage unavailable (private mode): the URL still carries the language.
        }
    }
}
