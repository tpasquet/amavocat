import { TestBed } from '@angular/core/testing';
import { configureComponentTest } from '../../../testing/test-helpers';
import { LayoutComponent } from './layout.component';

describe('LayoutComponent', () => {
  beforeEach(async () => {
    await configureComponentTest(LayoutComponent);
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(LayoutComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });
});
