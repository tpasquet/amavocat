import { TestBed } from '@angular/core/testing';
import { configureComponentTest } from '../../../testing/test-helpers';
import { PostDetailsComponent } from './post-details.component';

describe('PostDetailsComponent', () => {
  beforeEach(async () => {
    await configureComponentTest(PostDetailsComponent);
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(PostDetailsComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });
});
