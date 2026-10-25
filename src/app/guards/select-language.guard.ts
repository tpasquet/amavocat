import { Injectable } from '@angular/core';
import { Router, UrlTree } from '@angular/router';
import { LanguageService } from '../services/language.service';

@Injectable({
    providedIn: 'root'
})
export class SelectLanguageGuard {
    constructor(private router: Router, private languageService: LanguageService) { }

    canActivate(): UrlTree {
        return this.router.createUrlTree([this.languageService.getPreferredLanguage()]);
    }
}
