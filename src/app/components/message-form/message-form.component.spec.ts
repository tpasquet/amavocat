import { HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, fakeAsync, flush } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';
import { configureComponentTest } from '../../../testing/test-helpers';
import { environment } from '../../environments/environment';
import { MessageFormComponent } from './message-form.component';

describe('MessageFormComponent', () => {
  let fixture: ComponentFixture<MessageFormComponent>;
  let component: MessageFormComponent;
  let http: HttpTestingController;
  let element: HTMLElement;

  const fillValidForm = () => component.form.setValue({
    firstName: ' Jeanne ',
    lastName: 'Martin',
    email: 'jeanne@example.com',
    phone: '',
    message: 'Bonjour',
    consent: true,
    website: '',
  });

  beforeEach(async () => {
    await configureComponentTest(MessageFormComponent);
    fixture = TestBed.createComponent(MessageFormComponent);
    component = fixture.componentInstance;
    TestBed.inject(TranslateService).use('fr');
    http = TestBed.inject(HttpTestingController);
    element = fixture.nativeElement;
    fixture.detectChanges();
  });

  afterEach(() => http.verify());

  it('labels every visible field', () => {
    const fields = element.querySelectorAll('input:not([tabindex="-1"]), textarea');
    expect(fields.length).toBe(6);
    fields.forEach(field => {
      expect(element.querySelector(`label[for="${field.id}"]`)).withContext(field.id).not.toBeNull();
    });
  });

  it('does not send an invalid form and links the errors to their fields', fakeAsync(() => {
    element.querySelector<HTMLButtonElement>('button[type="submit"]')!.click();
    fixture.detectChanges();
    flush();

    http.expectNone(`${environment.apiUrl}/contact`);
    const email = element.querySelector<HTMLInputElement>('#contact-email')!;
    expect(email.getAttribute('aria-invalid')).toBe('true');
    expect(email.getAttribute('aria-describedby')).toContain('contact-email-error');
    expect(element.querySelector('#contact-consent-error')).not.toBeNull();
    // Focus goes to the first invalid field
    expect(document.activeElement?.id).toBe('contact-first-name');
  }));

  it('posts the trimmed message with the anti-spam fields and shows a confirmation', fakeAsync(() => {
    fillValidForm();
    component.onSubmit();

    const request = http.expectOne(`${environment.apiUrl}/contact`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(jasmine.objectContaining({
      firstName: 'Jeanne',
      consent: true,
      locale: component.language,
      website: '',
    }));
    expect(request.request.body.elapsedMs).toEqual(jasmine.any(Number));
    request.flush({ status: 'sent' }, { status: 202, statusText: 'Accepted' });
    flush();
    fixture.detectChanges();
    flush();

    const status = element.querySelector('[role="status"]');
    expect(status?.textContent).toContain('Votre message a bien été envoyé');
    expect(element.querySelector('form')).toBeNull();
    expect(component.form.controls.firstName.value).toBe('');
  }));

  it('shows a fallback with the phone number when the API fails', fakeAsync(() => {
    fillValidForm();
    component.onSubmit();
    http.expectOne(`${environment.apiUrl}/contact`).flush({ error: 'send_failed' }, { status: 502, statusText: 'Bad Gateway' });
    flush();
    fixture.detectChanges();

    const alert = element.querySelector('[role="alert"]');
    expect(alert?.textContent).toContain("n'a pas pu être envoyé");
    expect(alert?.querySelector('a[href="tel:+33769997560"]')).not.toBeNull();
    expect(component.submitError).toBe('unavailable');
  }));

  it('explains the rate limit', fakeAsync(() => {
    fillValidForm();
    component.onSubmit();
    http.expectOne(`${environment.apiUrl}/contact`).flush({}, { status: 429, statusText: 'Too Many Requests' });
    flush();
    expect(component.submitError).toBe('rateLimited');
  }));
});
