import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { configureComponentTest } from '../../../testing/test-helpers';
import { MobileActionBarComponent } from './mobile-action-bar.component';

describe('MobileActionBarComponent', () => {
  beforeEach(async () => {
    await configureComponentTest(MobileActionBarComponent);
  });

  it('should link to the phone number and the email address', () => {
    const fixture = TestBed.createComponent(MobileActionBarComponent);
    fixture.detectChanges();
    const hrefs = Array.from(fixture.nativeElement.querySelectorAll('a') as NodeListOf<HTMLAnchorElement>)
      .map(a => a.getAttribute('href'));
    expect(hrefs).toEqual(['tel:+33769997560', 'mailto:contact@aureliemanier-avocat.fr']);
  });

  it('should hide on the contact page', () => {
    spyOnProperty(TestBed.inject(Router), 'url').and.returnValue('/fr/contact');
    const fixture = TestBed.createComponent(MobileActionBarComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance.visible).toBeFalse();
    expect(fixture.nativeElement.querySelector('.mobile-action-bar')).toBeNull();
  });
});
