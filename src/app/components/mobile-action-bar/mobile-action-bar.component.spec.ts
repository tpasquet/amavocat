import { TestBed } from '@angular/core/testing';
import { Router, RouterLink } from '@angular/router';
import { configureComponentTest } from '../../../testing/test-helpers';
import { MobileActionBarComponent } from './mobile-action-bar.component';

describe('MobileActionBarComponent', () => {
  beforeEach(async () => {
    await configureComponentTest(MobileActionBarComponent, [], [RouterLink]);
  });

  it('should link to the phone number and to the contact form', () => {
    const fixture = TestBed.createComponent(MobileActionBarComponent);
    fixture.detectChanges();
    const hrefs = Array.from(fixture.nativeElement.querySelectorAll('a') as NodeListOf<HTMLAnchorElement>)
      .map(a => a.getAttribute('href'));
    expect(hrefs[0]).toBe('tel:+33769997560');
    expect(hrefs[1]).toMatch(/^\/(fr|en)\/contact#message$/);
    expect(hrefs).not.toContain('mailto:contact@aureliemanier-avocat.fr');
  });

  it('should hide on the contact page', () => {
    spyOnProperty(TestBed.inject(Router), 'url').and.returnValue('/fr/contact');
    const fixture = TestBed.createComponent(MobileActionBarComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance.visible).toBeFalse();
    expect(fixture.nativeElement.querySelector('.mobile-action-bar')).toBeNull();
  });
});
