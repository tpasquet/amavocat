import { Component, computed, inject, input, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { catchError, combineLatest, map, of, startWith, switchMap } from 'rxjs';
import { ApiService } from '../../core/api.service';
import { Entry, EntryStatus, Locale } from '../../core/models';
import { StatusBadgeComponent } from '../../fields/status-badge.component';

@Component({
  selector: 'app-entry-list',
  imports: [RouterLink, DatePipe, StatusBadgeComponent],
  templateUrl: './entry-list.component.html',
  styleUrl: './entry-list.component.scss',
})
export class EntryListComponent {
  private readonly api = inject(ApiService);

  /** Route param */
  readonly type = input.required<string>();

  readonly locale = signal<Locale | ''>('');
  readonly status = signal<EntryStatus | ''>('');

  readonly contentType = toSignal(toObservable(this.type).pipe(switchMap((type) => this.api.getContentType(type))));

  private readonly state = toSignal(
    combineLatest([toObservable(this.type), toObservable(this.locale), toObservable(this.status)]).pipe(
      switchMap(([type, locale, status]) =>
        this.api.listEntries(type, { locale: locale || undefined, status: status || undefined }).pipe(
          map((entries) => ({ entries, loading: false, error: false })),
          catchError(() => of({ entries: [] as Entry[], loading: false, error: true })),
          startWith({ entries: [] as Entry[], loading: true, error: false }),
        ),
      ),
    ),
    { initialValue: { entries: [] as Entry[], loading: true, error: false } },
  );

  readonly entries = computed(() => this.state().entries);
  readonly loading = computed(() => this.state().loading);
  readonly error = computed(() => this.state().error);

  title(entry: Entry): string {
    const field = this.contentType()?.titleField ?? 'title';
    const value = entry.data[field];
    return typeof value === 'string' && value ? value : '(sans titre)';
  }
}
