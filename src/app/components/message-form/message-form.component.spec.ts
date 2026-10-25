import { TestBed } from '@angular/core/testing';
import { configureComponentTest } from '../../../testing/test-helpers';
import { MessageFormComponent } from './message-form.component';

describe('MessageFormComponent', () => {
  beforeEach(async () => {
    await configureComponentTest(MessageFormComponent);
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(MessageFormComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });
});
