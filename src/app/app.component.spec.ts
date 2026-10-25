import { TestBed } from '@angular/core/testing';
import { configureComponentTest } from '../testing/test-helpers';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  beforeEach(async () => {
    await configureComponentTest(AppComponent);
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });
});
