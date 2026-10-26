import { TestBed } from '@angular/core/testing';
import { configureComponentTest } from '../../../testing/test-helpers';
import { ContactCtaComponent } from './contact-cta.component';

describe('ContactCtaComponent', () => {
  beforeEach(async () => {
    await configureComponentTest(ContactCtaComponent);
  });

  it('should link to the phone number and the email address', () => {
    const fixture = TestBed.createComponent(ContactCtaComponent);
    fixture.detectChanges();
    const hrefs = Array.from(fixture.nativeElement.querySelectorAll('a') as NodeListOf<HTMLAnchorElement>)
      .map(a => a.getAttribute('href'));
    expect(hrefs).toEqual(['tel:+33769997560', 'mailto:contact@aureliemanier-avocat.fr']);
  });
});
