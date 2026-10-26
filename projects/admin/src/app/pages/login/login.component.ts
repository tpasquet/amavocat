import { Component, inject, input, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  /** Page to return to after login (query param) */
  readonly next = input<string>();

  readonly form = inject(FormBuilder).nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });
  readonly error = signal<string | null>(null);
  readonly pending = signal(false);

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { email, password } = this.form.getRawValue();
    this.pending.set(true);
    this.error.set(null);
    this.auth.login(email, password).subscribe({
      next: () => {
        const next = this.next();
        void this.router.navigateByUrl(next?.startsWith('/') && !next.startsWith('//') ? next : '/');
      },
      error: (err: HttpErrorResponse) => {
        this.pending.set(false);
        this.error.set(
          err.status === 429
            ? 'Trop de tentatives. Réessayez dans 15 minutes.'
            : err.status === 401
              ? 'Email ou mot de passe incorrect.'
              : 'Connexion impossible pour le moment. Réessayez plus tard.',
        );
      },
    });
  }
}
