import { Component, DestroyRef, ElementRef, EventEmitter, HostListener, OnInit, Output } from '@angular/core';
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
    private destroyRef: DestroyRef,
    private elementRef: ElementRef<HTMLElement>
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

  @HostListener('document:click', ['$event.target'])
  onDocumentClick(target: EventTarget | null) {
    if (this.isOpen && !this.elementRef.nativeElement.contains(target as Node | null)) {
      this.closeDropdown();
    }
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    this.closeDropdown();
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
