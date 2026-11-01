import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, ElementRef, OnInit, ViewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { SupportedLanguages } from '../../global/enum';
import { LanguageService } from '../../services/language.service';

export type SubmitError = 'rateLimited' | 'invalid' | 'unavailable';

// Same limits as the API (api/src/contact/routes.ts)
export const CONTACT_LIMITS = { name: 80, email: 254, phone: 30, message: 5000 };

@Component({
    selector: 'app-message-form',
    templateUrl: './message-form.component.html',
    styleUrls: ['./message-form.component.scss'],
    standalone: false
})
export class MessageFormComponent implements OnInit {
  readonly limits = CONTACT_LIMITS;
  readonly form;

  language: SupportedLanguages = SupportedLanguages.FR;
  submitted = false;
  isSubmitting = false;
  sent = false;
  submitError: SubmitError | null = null;

  /** Time the form was displayed, sent to the API as a cheap bot filter */
  private displayedAt = Date.now();

  @ViewChild('formElement') private formElement?: ElementRef<HTMLFormElement>;
  @ViewChild('successMessage') private successMessage?: ElementRef<HTMLElement>;
  @ViewChild('errorMessage') private errorMessage?: ElementRef<HTMLElement>;

  constructor(
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private languageService: LanguageService,
    private destroyRef: DestroyRef,
  ) {
    this.form = this.formBuilder.nonNullable.group({
      firstName: ['', [Validators.required, Validators.maxLength(CONTACT_LIMITS.name), notBlank]],
      lastName: ['', [Validators.required, Validators.maxLength(CONTACT_LIMITS.name), notBlank]],
      email: ['', [Validators.required, Validators.maxLength(CONTACT_LIMITS.email), Validators.pattern(EMAIL_PATTERN)]],
      phone: ['', [Validators.maxLength(CONTACT_LIMITS.phone), Validators.pattern(/^[0-9+().\s-]*$/)]],
      message: ['', [Validators.required, Validators.maxLength(CONTACT_LIMITS.message), notBlank]],
      consent: [false, Validators.requiredTrue],
      // Honeypot: hidden from people and assistive technologies, filled in by bots
      website: [''],
    });
  }

  ngOnInit(): void {
    this.languageService.currentLang$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(lang => this.language = lang);
    this.displayedAt = Date.now();
  }

  /** Errors are shown once the field was left, or after a submit attempt */
  showError(name: keyof typeof this.form.controls): boolean {
    const control = this.form.controls[name];
    return control.invalid && (control.touched || this.submitted);
  }

  hasError(name: keyof typeof this.form.controls, error: string): boolean {
    return this.form.controls[name].hasError(error);
  }

  async onSubmit(): Promise<void> {
    this.submitted = true;
    this.submitError = null;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.focusFirstInvalidField();
      return;
    }

    this.isSubmitting = true;
    const value = this.form.getRawValue();
    try {
      await firstValueFrom(this.http.post(`${environment.apiUrl}/contact`, {
        firstName: value.firstName.trim(),
        lastName: value.lastName.trim(),
        email: value.email.trim(),
        phone: value.phone.trim(),
        message: value.message.trim(),
        consent: value.consent,
        locale: this.language,
        website: value.website,
        elapsedMs: Date.now() - this.displayedAt,
      }));
      this.sent = true;
      this.form.reset();
      this.submitted = false;
      setTimeout(() => this.successMessage?.nativeElement.focus());
    } catch (error) {
      this.submitError = toSubmitError(error);
      setTimeout(() => this.errorMessage?.nativeElement.focus());
    } finally {
      this.isSubmitting = false;
    }
  }

  writeAnother(): void {
    this.sent = false;
    this.displayedAt = Date.now();
    setTimeout(() => this.formElement?.nativeElement.querySelector<HTMLElement>('input')?.focus());
  }

  private focusFirstInvalidField(): void {
    setTimeout(() => this.formElement?.nativeElement.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
  }
}

// Same shape as most browsers' type=email check, plus a dot in the domain
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function notBlank(control: { value: unknown }) {
  return typeof control.value === 'string' && control.value.length > 0 && control.value.trim() === ''
    ? { required: true }
    : null;
}

function toSubmitError(error: unknown): SubmitError {
  if (error instanceof HttpErrorResponse) {
    if (error.status === 429) {
      return 'rateLimited';
    }
    if (error.status === 400) {
      return 'invalid';
    }
  }
  return 'unavailable';
}
