import { Component, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { ApiService } from '../../core/api.service';
import { ApiError, ContentTypeDescriptor, Entry, EntryTranslation, EntryWrite, FieldDescriptor, Locale } from '../../core/models';
import { ImageFieldComponent } from '../../fields/image-field.component';
import { RichTextEditorComponent } from '../../fields/rich-text-editor.component';
import { StatusBadgeComponent } from '../../fields/status-badge.component';
import { TagsInputComponent } from '../../fields/tags-input.component';

type PublishMode = 'draft' | 'now' | 'schedule';

const localeLabels: Record<Locale, string> = { fr: 'Français', en: 'Anglais' };

/** "2026-10-26T09:30" in the browser's time zone, the format of <input type="datetime-local"> */
function toLocalInput(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

@Component({
  selector: 'app-entry-edit',
  imports: [ReactiveFormsModule, RouterLink, RichTextEditorComponent, TagsInputComponent, ImageFieldComponent, StatusBadgeComponent],
  templateUrl: './entry-edit.component.html',
  styleUrl: './entry-edit.component.scss',
})
export class EntryEditComponent {
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);

  // Route params and query params
  readonly type = input.required<string>();
  readonly id = input.required<string>();
  readonly translationOf = input<string>();
  readonly locale = input<Locale>();

  readonly localeLabels = localeLabels;
  readonly contentType = signal<ContentTypeDescriptor | undefined>(undefined);
  readonly entry = signal<Entry | undefined>(undefined);
  readonly translations = signal<EntryTranslation[]>([]);
  readonly loadError = signal(false);
  readonly saving = signal(false);
  readonly message = signal<{ kind: 'success' | 'error'; text: string } | null>(null);

  readonly isNew = computed(() => this.id() === 'new');
  readonly missingLocales = computed(() => {
    const entry = this.entry();
    if (!entry || !this.contentType()?.localized) return [];
    const taken = new Set([entry.locale, ...this.translations().map((t) => t.locale)]);
    return (Object.keys(localeLabels) as Locale[]).filter((l) => !taken.has(l));
  });

  form?: FormGroup<{
    locale: FormControl<Locale>;
    slug: FormControl<string>;
    publishMode: FormControl<PublishMode>;
    publishAt: FormControl<string>;
    data: FormGroup<Record<string, FormControl<unknown>>>;
  }>;

  constructor() {
    effect(() => {
      const type = this.type();
      const id = this.id();
      // Already showing this entry (just created it): keep the form and the confirmation message
      if (untracked(() => this.entry()?.id) === id) return;
      untracked(() => this.load(type, id === 'new' ? undefined : id));
    });
  }

  private load(type: string, id: string | undefined): void {
    this.loadError.set(false);
    this.message.set(null);
    this.form = undefined;
    forkJoin([this.api.getContentType(type), id ? this.api.getEntry(type, id) : of(undefined)]).subscribe({
      next: ([contentType, loaded]) => {
        if (!contentType) {
          this.loadError.set(true);
          return;
        }
        this.contentType.set(contentType);
        this.entry.set(loaded?.entry);
        this.translations.set(loaded?.translations ?? []);
        this.form = this.buildForm(contentType, loaded?.entry);
      },
      error: () => this.loadError.set(true),
    });
  }

  private buildForm(contentType: ContentTypeDescriptor, entry: Entry | undefined) {
    const data = new FormGroup<Record<string, FormControl<unknown>>>({});
    for (const field of contentType.fields) {
      data.addControl(field.key, new FormControl<unknown>(entry?.data[field.key] ?? this.emptyValue(field), this.validators(field)));
    }
    const publishAt = entry?.publishAt ? new Date(entry.publishAt) : null;
    const publishMode: PublishMode = !publishAt ? 'draft' : publishAt.getTime() > Date.now() ? 'schedule' : 'now';
    return new FormGroup({
      locale: new FormControl<Locale>(entry?.locale ?? this.locale() ?? 'fr', { nonNullable: true }),
      slug: new FormControl(entry?.slug ?? '', { nonNullable: true, validators: Validators.pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/) }),
      publishMode: new FormControl<PublishMode>(publishMode, { nonNullable: true }),
      publishAt: new FormControl(publishAt && publishMode === 'schedule' ? toLocalInput(publishAt) : '', { nonNullable: true }),
      data,
    });
  }

  private emptyValue(field: FieldDescriptor): unknown {
    switch (field.kind) {
      case 'tags':
        return [];
      case 'image':
        return null;
      case 'boolean':
        return false;
      default:
        return '';
    }
  }

  private validators(field: FieldDescriptor): ValidatorFn[] {
    const validators: ValidatorFn[] = [];
    if (field.required) validators.push(field.kind === 'boolean' ? Validators.requiredTrue : Validators.required);
    if (field.max && (field.kind === 'text' || field.kind === 'longText')) validators.push(Validators.maxLength(field.max));
    return validators;
  }

  control(key: string): FormControl<unknown> {
    return this.form!.controls.data.controls[key]!;
  }

  fieldId(field: FieldDescriptor): string {
    return `field-${field.key}`;
  }

  length(key: string): number {
    const value = this.control(key).value;
    return typeof value === 'string' ? value.length : 0;
  }

  save(): void {
    const form = this.form;
    const contentType = this.contentType();
    if (!form || !contentType) return;
    if (form.invalid) {
      form.markAllAsTouched();
      this.message.set({ kind: 'error', text: 'Certains champs sont incomplets ou trop longs.' });
      return;
    }
    const raw = form.getRawValue();
    let publishAt: string | null = null;
    if (contentType.schedulable) {
      if (raw.publishMode === 'now') {
        // Keep the original date of an article that is already online
        const current = this.entry();
        publishAt = current?.status === 'published' && current.publishAt ? current.publishAt : new Date().toISOString();
      } else if (raw.publishMode === 'schedule') {
        const date = new Date(raw.publishAt);
        if (!raw.publishAt || Number.isNaN(date.getTime())) {
          this.message.set({ kind: 'error', text: 'Choisissez la date et l’heure de publication.' });
          return;
        }
        publishAt = date.toISOString();
      }
    }

    // Optional fields left empty are not sent
    const data = Object.fromEntries(
      Object.entries(raw.data).filter(([, value]) => value !== null && value !== ''),
    );
    const body: EntryWrite = { publishAt, data };
    if (raw.slug) body.slug = raw.slug;

    this.saving.set(true);
    this.message.set(null);
    const current = this.entry();
    const request = current
      ? this.api.updateEntry(contentType.name, current.id, body)
      : this.api.createEntry(contentType.name, {
          ...body,
          locale: contentType.localized ? raw.locale : null,
          translationOf: this.translationOf(),
        });

    request.subscribe({
      next: (saved) => {
        this.saving.set(false);
        this.entry.set(saved);
        form.controls.slug.setValue(saved.slug);
        form.markAsPristine();
        this.message.set({ kind: 'success', text: this.successText(saved) });
        if (!current) {
          void this.router.navigate(['/content', contentType.name, saved.id], { replaceUrl: true });
        }
      },
      error: (err: HttpErrorResponse) => {
        this.saving.set(false);
        const apiError = err.error as ApiError | null;
        const text =
          apiError?.error === 'slug_taken'
            ? 'Cette adresse (slug) est déjà utilisée. Choisissez-en une autre.'
            : apiError?.error === 'translation_exists'
              ? 'Une version dans cette langue existe déjà.'
              : apiError?.error === 'validation'
                ? 'Certains champs ne sont pas valides.'
                : "L'enregistrement a échoué. Réessayez dans un instant.";
        this.message.set({ kind: 'error', text });
      },
    });
  }

  private successText(entry: Entry): string {
    switch (entry.status) {
      case 'published':
        return 'Enregistré. Le site sera mis à jour dans quelques minutes.';
      case 'scheduled':
        return 'Enregistré. La publication est programmée.';
      default:
        return 'Brouillon enregistré.';
    }
  }

  remove(): void {
    const entry = this.entry();
    const contentType = this.contentType();
    if (!entry || !contentType) return;
    if (!window.confirm('Supprimer définitivement cet élément ?')) return;
    this.api.deleteEntry(contentType.name, entry.id).subscribe({
      next: () => void this.router.navigate(['/content', contentType.name]),
      error: () => this.message.set({ kind: 'error', text: 'La suppression a échoué.' }),
    });
  }
}
