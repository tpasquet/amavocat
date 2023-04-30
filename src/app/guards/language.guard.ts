import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { SupportedLanguages } from '../global/enum';
import { LanguageService } from '../services/language.service';

@Injectable({
    providedIn: 'root'
})
export class LanguageGuard {

    constructor(private router: Router, private languageService: LanguageService) { }

    canActivate(route: ActivatedRouteSnapshot): boolean {
        const lang = route.params['lang'];
        if (Object.values(SupportedLanguages).includes(lang)) {
            return true;
        } else {
            this.router.navigate([`/${this.languageService.getCurrentLang()}`]);
            return false;
        }
    }

}