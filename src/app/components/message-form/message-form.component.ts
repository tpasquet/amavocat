import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { firstValueFrom } from 'rxjs';

@Component({
    selector: 'app-message-form',
    templateUrl: './message-form.component.html',
    styleUrls: ['./message-form.component.scss'],
    standalone: false
})
export class MessageFormComponent {
  form: FormGroup;
  isSubmitting = false;
  submitSuccess = false;
  submitError = '';

  constructor(
    private formBuilder: FormBuilder,
    private http: HttpClient
  ) {
    this.form = this.formBuilder.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      phoneNumber: ['', Validators.required],
      email: [''],
      message: ['', Validators.required]
    });
  }

  async onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.submitSuccess = false;
    this.submitError = '';

    try {
      // Appel à votre API backend au lieu de Firebase Functions
      await firstValueFrom(
        this.http.post(`${environment.apiUrl}/contact`, this.form.value)
      );

      this.submitSuccess = true;
      this.form.reset();

      setTimeout(() => {
        this.submitSuccess = false;
      }, 5000);
    } catch (error: any) {
      console.error('Erreur lors de l\'envoi:', error);
      this.submitError = error.message || 'Une erreur est survenue. Veuillez réessayer.';
    } finally {
      this.isSubmitting = false;
    }
  }
}
