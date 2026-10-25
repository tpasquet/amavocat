import { TestBed } from '@angular/core/testing';
import { configureComponentTest } from '../../../testing/test-helpers';
import { DomainsComponent } from './domains.component';

describe('DomainsComponent', () => {
  beforeEach(async () => {
    await configureComponentTest(DomainsComponent);
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(DomainsComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });
});
