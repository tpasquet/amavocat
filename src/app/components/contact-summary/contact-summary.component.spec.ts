import { TestBed } from '@angular/core/testing';
import { configureComponentTest } from '../../../testing/test-helpers';
import { ContactSummaryComponent } from './contact-summary.component';

describe('ContactSummaryComponent', () => {
  beforeEach(async () => {
    await configureComponentTest(ContactSummaryComponent);
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(ContactSummaryComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });
});
