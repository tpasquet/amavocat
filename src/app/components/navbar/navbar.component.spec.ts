import { TestBed } from '@angular/core/testing';
import { configureComponentTest } from '../../../testing/test-helpers';
import { NavbarComponent } from './navbar.component';

describe('NavbarComponent', () => {
  beforeEach(async () => {
    await configureComponentTest(NavbarComponent);
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(NavbarComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });
});
