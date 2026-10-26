import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, catchError, map, of, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { User } from './models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/auth`;

  /** undefined = not checked yet, null = logged out */
  readonly user = signal<User | null | undefined>(undefined);

  /** Resolves the current session once, then answers from memory */
  ensureSession(): Observable<User | null> {
    const known = this.user();
    if (known !== undefined) {
      return of(known);
    }
    return this.http.get<{ user: User }>(`${this.base}/me`).pipe(
      map((res) => res.user),
      catchError(() => of(null)),
      tap((user) => this.user.set(user)),
    );
  }

  login(email: string, password: string): Observable<User> {
    return this.http.post<{ user: User }>(`${this.base}/login`, { email, password }).pipe(
      map((res) => res.user),
      tap((user) => this.user.set(user)),
    );
  }

  logout(): Observable<void> {
    return this.http.post<void>(`${this.base}/logout`, {}).pipe(tap(() => this.user.set(null)));
  }

  /** Called when the API answers 401 (expired session) */
  sessionExpired(): void {
    this.user.set(null);
  }
}
