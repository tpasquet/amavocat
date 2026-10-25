import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router, UrlTree } from '@angular/router';
import { LanguageService } from '../services/language.service';
import { isSupportedLanguage } from '../utils/language';

@Injectable({
    providedIn: 'root'
})
export class LanguageGuard {

    constructor(private router: Router, private languageService: LanguageService) { }

    canActivate(route: ActivatedRouteSnapshot): boolean | UrlTree {
        const lang = route.params['lang'];
        if (isSupportedLanguage(lang)) {
            this.languageService.use(lang);
            return true;
        }
        return this.router.createUrlTree([this.languageService.getPreferredLanguage()]);
    }

}
