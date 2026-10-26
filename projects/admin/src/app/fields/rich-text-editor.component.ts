import { Component, ElementRef, OnDestroy, afterNextRender, forwardRef, inject, input, signal, viewChild } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import { ApiService } from '../core/api.service';

type Chain = ReturnType<Editor['chain']>;
type Command = (chain: Chain) => Chain;

/** WYSIWYG editor (TipTap) producing the HTML subset the API keeps when it sanitizes rich text */
@Component({
  selector: 'app-rich-text-editor',
  templateUrl: './rich-text-editor.component.html',
  styleUrl: './rich-text-editor.component.scss',
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => RichTextEditorComponent), multi: true }],
})
export class RichTextEditorComponent implements ControlValueAccessor, OnDestroy {
  private readonly api = inject(ApiService);

  readonly inputId = input.required<string>();
  readonly host = viewChild.required<ElementRef<HTMLDivElement>>('host');
  readonly fileInput = viewChild.required<ElementRef<HTMLInputElement>>('fileInput');

  /** Bumped on every transaction so the toolbar re-reads the active marks */
  readonly revision = signal(0);
  readonly uploading = signal(false);

  editor?: Editor;

  // Toolbar commands, applied to a focused chain by run()
  readonly toggleH2: Command = (c) => c.toggleHeading({ level: 2 });
  readonly toggleH3: Command = (c) => c.toggleHeading({ level: 3 });
  readonly toggleBold: Command = (c) => c.toggleBold();
  readonly toggleItalic: Command = (c) => c.toggleItalic();
  readonly toggleUnderline: Command = (c) => c.toggleUnderline();
  readonly toggleBulletList: Command = (c) => c.toggleBulletList();
  readonly toggleOrderedList: Command = (c) => c.toggleOrderedList();
  readonly toggleBlockquote: Command = (c) => c.toggleBlockquote();
  readonly undo: Command = (c) => c.undo();
  readonly redo: Command = (c) => c.redo();
  private pendingValue = '';
  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  constructor() {
    afterNextRender(() => {
      this.editor = new Editor({
        element: this.host().nativeElement,
        extensions: [
          StarterKit.configure({
            heading: { levels: [2, 3, 4] },
            link: { openOnClick: false, autolink: true, protocols: ['mailto', 'tel'] },
          }),
          Image,
        ],
        content: this.pendingValue,
        editorProps: {
          attributes: { id: this.inputId(), class: 'prose', role: 'textbox', 'aria-multiline': 'true' },
        },
        onTransaction: () => this.revision.update((n) => n + 1),
        onUpdate: ({ editor }) => this.onChange(editor.isEmpty ? '' : editor.getHTML()),
        onBlur: () => this.onTouched(),
      });
    });
  }

  writeValue(value: string | null): void {
    this.pendingValue = value ?? '';
    if (this.editor && this.editor.getHTML() !== this.pendingValue) {
      this.editor.commands.setContent(this.pendingValue, { emitUpdate: false });
    }
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(disabled: boolean): void {
    this.editor?.setEditable(!disabled);
  }

  isActive(name: string, attrs?: Record<string, unknown>): boolean {
    this.revision();
    return this.editor?.isActive(name, attrs) ?? false;
  }

  run(command: Command): void {
    if (this.editor) {
      command(this.editor.chain().focus()).run();
    }
  }

  toggleLink(): void {
    if (!this.editor) return;
    if (this.editor.isActive('link')) {
      this.run((c) => c.unsetLink());
      return;
    }
    const url = window.prompt('Adresse du lien (https://…, mailto:…)');
    if (url && /^(https?:|mailto:|tel:)/i.test(url.trim())) {
      this.run((c) => c.extendMarkRange('link').setLink({ href: url.trim() }));
    }
  }

  pickImage(): void {
    this.fileInput().nativeElement.click();
  }

  uploadImage(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;
    this.uploading.set(true);
    this.api.uploadImage(file).subscribe({
      next: ({ url }) => {
        this.uploading.set(false);
        const alt = window.prompt("Description de l'image (pour l'accessibilité)") ?? '';
        this.run((c) => c.setImage({ src: url, alt }));
      },
      error: () => {
        this.uploading.set(false);
        window.alert("L'image n'a pas pu être envoyée (JPEG, PNG, WebP ou GIF, 8 Mo maximum).");
      },
    });
  }

  ngOnDestroy(): void {
    this.editor?.destroy();
  }
}
