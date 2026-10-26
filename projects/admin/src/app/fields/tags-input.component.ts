import { Component, forwardRef, input, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-tags-input',
  template: `
    <div class="tags">
      @for (tag of tags(); track tag) {
        <span class="tag">
          {{ tag }}
          <button type="button" (click)="remove(tag)" [attr.aria-label]="'Retirer ' + tag">×</button>
        </span>
      }
      <input
        type="text"
        [id]="inputId()"
        placeholder="Ajouter puis Entrée"
        (keydown.enter)="add($event)"
        (keydown.comma)="add($event)"
        (blur)="add($event)"
      />
    </div>
  `,
  styles: `
    .tags { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }
    .tag { display: inline-flex; align-items: center; gap: 4px; padding: 4px 4px 4px 10px; border-radius: 999px; background: var(--light); }
    .tag button { border: 0; background: none; font-size: 16px; line-height: 1; cursor: pointer; color: var(--muted); }
    input { flex: 1; min-width: 180px; }
  `,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => TagsInputComponent), multi: true }],
})
export class TagsInputComponent implements ControlValueAccessor {
  readonly inputId = input.required<string>();
  readonly tags = signal<string[]>([]);
  private onChange: (value: string[]) => void = () => {};
  private onTouched: () => void = () => {};

  add(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value.replace(/,/g, '').trim();
    if (event.type !== 'blur') event.preventDefault();
    else this.onTouched();
    if (value && !this.tags().includes(value)) {
      this.update([...this.tags(), value]);
    }
    input.value = '';
  }

  remove(tag: string): void {
    this.update(this.tags().filter((t) => t !== tag));
  }

  private update(tags: string[]): void {
    this.tags.set(tags);
    this.onChange(tags);
  }

  writeValue(value: string[] | null): void {
    this.tags.set(value ?? []);
  }

  registerOnChange(fn: (value: string[]) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
}
