import { Component, DestroyRef, ElementRef, EventEmitter, HostListener, OnInit, Output, ViewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SupportedLanguages } from 'src/app/global/enum';
import { LanguageService } from 'src/app/services/language.service';

let nextId = 0;

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
  /** The navbar renders a selector in the desktop bar or in the mobile menu: ids stay unique either way */
  readonly listId = `language-options-${nextId++}`;
  @ViewChild('trigger') private trigger?: ElementRef<HTMLButtonElement>;

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
    if (!this.isOpen) {
      return;
    }
    const focusWasInside = this.elementRef.nativeElement.contains(document.activeElement);
    this.closeDropdown();
    // The focused option disappears with the list: give focus back to the button
    if (focusWasInside) {
      this.trigger?.nativeElement.focus();
    }
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
