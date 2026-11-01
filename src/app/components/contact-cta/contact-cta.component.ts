import { Component, DestroyRef, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LanguageService } from '../../services/language.service';

/**
 * Closing call to action shown at the bottom of content pages: call, or write through the
 * contact form (the email address itself is only offered in the contact details).
 */
@Component({
    selector: 'app-contact-cta',
    templateUrl: './contact-cta.component.html',
    styleUrls: ['./contact-cta.component.scss'],
    standalone: false
})
export class ContactCtaComponent implements OnInit {
  language: string = 'fr';

  constructor(private languageService: LanguageService, private destroyRef: DestroyRef) { }

  ngOnInit(): void {
    this.languageService.currentLang$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(lang => this.language = lang);
  }
}
