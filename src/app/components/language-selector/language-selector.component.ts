import { Component, DestroyRef, EventEmitter, OnInit, Output } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SupportedLanguages } from 'src/app/global/enum';
import { LanguageService } from 'src/app/services/language.service';

@Component({
    selector: 'app-language-selector',
    templateUrl: './language-selector.component.html',
    styleUrls: ['./language-selector.component.scss'],
    standalone: false
})
export class LanguageSelectorComponent implements OnInit {
  language: SupportedLanguages;
  isOpen: boolean = false;
  @Output() languageChanged = new EventEmitter<SupportedLanguages>();

  constructor(
    private languageService: LanguageService,
    private destroyRef: DestroyRef
  ) {
    this.language = this.languageService.getCurrentLang();
  }

  ngOnInit() {
    this.languageService.currentLang$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(lang => this.language = lang);
  }

  toggleDropdown() {
    this.isOpen = !this.isOpen;
  }

  closeDropdown() {
    this.isOpen = false;
  }

  selectLanguage(lang: 'fr' | 'en') {
    const target = lang as SupportedLanguages;
    if (this.language !== target) {
      // Navigation vers la même page dans la nouvelle langue ; LanguageGuard applique la langue
      this.languageService.switchTo(target);
      this.languageChanged.emit(target);
    }
    this.closeDropdown();
  }
}
