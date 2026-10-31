import { Component, DestroyRef, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LanguageService } from '../../services/language.service';

@Component({
    selector: 'app-footer',
    templateUrl: './footer.component.html',
    styleUrls: ['./footer.component.scss'],
    standalone: false
})
export class FooterComponent implements OnInit {
  language: string = 'fr';
  // Evaluated at runtime in the browser, so the prerendered year never goes stale
  readonly currentYear = new Date().getFullYear();

  constructor(
    private languageService: LanguageService,
    private destroyRef: DestroyRef
  ) { }

  ngOnInit(): void {
    this.languageService.currentLang$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(lang => this.language = lang);
  }

}
