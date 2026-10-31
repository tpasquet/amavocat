import { TestBed } from '@angular/core/testing';
import { configureComponentTest } from '../../../testing/test-helpers';
import { FooterComponent } from './footer.component';

describe('FooterComponent', () => {
  beforeEach(async () => {
    await configureComponentTest(FooterComponent);
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(FooterComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should show the current year in the copyright line', () => {
    const fixture = TestBed.createComponent(FooterComponent);
    fixture.detectChanges();
    const copyright: HTMLElement = fixture.nativeElement.querySelector('.footer-copyright');
    expect(copyright.textContent).toContain(`© ${new Date().getFullYear()}`);
  });
});
