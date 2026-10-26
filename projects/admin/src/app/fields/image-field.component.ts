import { Component, forwardRef, inject, input, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ApiService } from '../core/api.service';
import { ImageValue } from '../core/models';

@Component({
  selector: 'app-image-field',
  template: `
    @if (value(); as image) {
      <div class="preview">
        <img [src]="image.url" [alt]="image.alt" />
        <div class="side">
          <label [for]="inputId() + '-alt'">Description de l'image (accessibilité)</label>
          <input type="text" [id]="inputId() + '-alt'" [value]="image.alt" (input)="setAlt($any($event.target).value)" />
          <button type="button" class="btn btn-danger btn-small" (click)="clear()">Retirer l'image</button>
        </div>
      </div>
    } @else {
      <label class="btn btn-secondary" [for]="inputId()">{{ uploading() ? 'Envoi…' : 'Choisir une image' }}</label>
    }
    <input
      type="file"
      class="visually-hidden"
      [id]="inputId()"
      accept="image/jpeg,image/png,image/webp,image/gif"
      (change)="upload($event)"
    />
    @if (error()) {
      <span class="error" role="alert">{{ error() }}</span>
    }
  `,
  styles: `
    .preview { display: flex; gap: 16px; align-items: flex-start; flex-wrap: wrap; }
    img { width: 240px; max-width: 100%; border-radius: var(--radius); border: 1px solid var(--border); }
    .side { flex: 1; min-width: 220px; display: flex; flex-direction: column; gap: 8px; align-items: flex-start; }
    label.btn { align-self: flex-start; }
    .error { color: var(--danger); font-size: 14px; }
  `,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => ImageFieldComponent), multi: true }],
})
export class ImageFieldComponent implements ControlValueAccessor {
  private readonly api = inject(ApiService);

  readonly inputId = input.required<string>();
  readonly value = signal<ImageValue | null>(null);
  readonly uploading = signal(false);
  readonly error = signal<string | null>(null);
  private onChange: (value: ImageValue | null) => void = () => {};
  private onTouched: () => void = () => {};

  upload(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;
    this.uploading.set(true);
    this.error.set(null);
    this.api.uploadImage(file).subscribe({
      next: ({ url }) => {
        this.uploading.set(false);
        this.update({ url, alt: '' });
      },
      error: () => {
        this.uploading.set(false);
        this.error.set("L'image n'a pas pu être envoyée (JPEG, PNG, WebP ou GIF, 8 Mo maximum).");
      },
    });
  }

  setAlt(alt: string): void {
    const current = this.value();
    if (current) this.update({ ...current, alt });
  }

  clear(): void {
    this.update(null);
  }

  private update(value: ImageValue | null): void {
    this.value.set(value);
    this.onChange(value);
    this.onTouched();
  }

  writeValue(value: ImageValue | null): void {
    this.value.set(value ?? null);
  }

  registerOnChange(fn: (value: ImageValue | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
}
