import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map, shareReplay } from 'rxjs';
import { environment } from '../../environments/environment';
import { ContentTypeDescriptor, Entry, EntryStatus, EntryTranslation, EntryWrite, Locale } from './models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiUrl;

  private contentTypes$?: Observable<ContentTypeDescriptor[]>;

  getContentTypes(): Observable<ContentTypeDescriptor[]> {
    this.contentTypes$ ??= this.http
      .get<{ contentTypes: ContentTypeDescriptor[] }>(`${this.base}/admin/content-types`)
      .pipe(
        map((res) => res.contentTypes),
        shareReplay(1),
      );
    return this.contentTypes$;
  }

  getContentType(name: string): Observable<ContentTypeDescriptor | undefined> {
    return this.getContentTypes().pipe(map((types) => types.find((type) => type.name === name)));
  }

  listEntries(type: string, filter: { locale?: Locale; status?: EntryStatus } = {}): Observable<Entry[]> {
    const params: Record<string, string> = {};
    if (filter.locale) params['locale'] = filter.locale;
    if (filter.status) params['status'] = filter.status;
    return this.http
      .get<{ entries: Entry[] }>(`${this.base}/admin/entries/${type}`, { params })
      .pipe(map((res) => res.entries));
  }

  getEntry(type: string, id: string): Observable<{ entry: Entry; translations: EntryTranslation[] }> {
    return this.http.get<{ entry: Entry; translations: EntryTranslation[] }>(`${this.base}/admin/entries/${type}/${id}`);
  }

  createEntry(type: string, body: EntryWrite): Observable<Entry> {
    return this.http.post<{ entry: Entry }>(`${this.base}/admin/entries/${type}`, body).pipe(map((res) => res.entry));
  }

  updateEntry(type: string, id: string, body: EntryWrite): Observable<Entry> {
    return this.http
      .put<{ entry: Entry }>(`${this.base}/admin/entries/${type}/${id}`, body)
      .pipe(map((res) => res.entry));
  }

  deleteEntry(type: string, id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/admin/entries/${type}/${id}`);
  }

  uploadImage(file: File): Observable<{ url: string }> {
    const body = new FormData();
    body.append('file', file);
    return this.http.post<{ url: string }>(`${this.base}/admin/media`, body);
  }
}
