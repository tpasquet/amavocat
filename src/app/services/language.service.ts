import { Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Constants } from '../global/constant';
import { SupportedLanguages } from '../global/enum';
import { isSupportedLanguage } from '../utils/language';

@Injectable({
    providedIn: 'root'
})
export class LanguageService {
    private currentLang: string;

    constructor(private router: Router) {
        this.currentLang = this.getInitialLanguage();
        this.listenForLanguageChange();
        console.log("LanguageService constructor called", this.currentLang)
    }

    getInitialLanguage(): SupportedLanguages {
        if (this.getLanguageFromLocalStorage()) {
            return this.getLanguageFromLocalStorage() as SupportedLanguages;
        }
        const lang = this.getBrowserLanguage();
        if (lang && isSupportedLanguage(lang)) {
            return lang as SupportedLanguages;
        }
        return Constants.DEFAULT_LANG as SupportedLanguages;
    }

    listenForLanguageChange() {
        this.router.events.subscribe(event => {
            if (event instanceof NavigationEnd) {
                const lang = this.getLangFromUrl(event.url);
                if (lang && isSupportedLanguage(lang)) {
                    this.setCurrentLang(lang);
                }
            }
        });
    }

    redirectToLanguagePath() {
        this.router.navigate([this.currentLang]);
    }

    private getLangFromUrl(url: string): string | null {
        return url.split('/')[1];
    }

    getBrowserLanguage(): string | null {
        return window.navigator.language;
    }

    getLanguageFromLocalStorage(): string | null {
        return localStorage.getItem(Constants.LOCAL_STORAGE.LANG_KEY);
    }

    getCurrentLang(): SupportedLanguages {
        return this.currentLang as SupportedLanguages;
    }

    setCurrentLang(lang: string) {
        this.currentLang = lang;
        localStorage.setItem(Constants.LOCAL_STORAGE.LANG_KEY, lang);
    }
}
