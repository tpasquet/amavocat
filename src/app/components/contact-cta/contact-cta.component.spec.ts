import { TestBed } from '@angular/core/testing';
import { RouterLink } from '@angular/router';
import { configureComponentTest } from '../../../testing/test-helpers';
import { ContactCtaComponent } from './contact-cta.component';

describe('ContactCtaComponent', () => {
  beforeEach(async () => {
    await configureComponentTest(ContactCtaComponent, [], [RouterLink]);
  });

  it('should link to the phone number and to the contact form', () => {
    const fixture = TestBed.createComponent(ContactCtaComponent);
    fixture.detectChanges();
    const hrefs = Array.from(fixture.nativeElement.querySelectorAll('a') as NodeListOf<HTMLAnchorElement>)
      .map(a => a.getAttribute('href'));
    expect(hrefs[0]).toBe('tel:+33769997560');
    expect(hrefs[1]).toMatch(/^\/(fr|en)\/contact#message$/);
    expect(hrefs).not.toContain('mailto:contact@aureliemanier-avocat.fr');
  });
});
