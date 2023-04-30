import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Constants } from '../global/constant';
import { LanguageService } from '../services/language.service';

@Injectable({
    providedIn: 'root'
})
export class SelectLanguageGuard {
    constructor(private router: Router, private languageService: LanguageService) { }

    canActivate(): boolean {
        const lang = this.languageService.getCurrentLang();
        if (lang) {
            this.router.navigateByUrl(`${lang}`);
            return false;
        } else {
            this.router.navigateByUrl(`/${Constants.DEFAULT_LANG}`);
            return false;
        }
    }
}
