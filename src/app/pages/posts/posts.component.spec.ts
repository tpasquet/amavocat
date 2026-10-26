import { TestBed } from '@angular/core/testing';
import { configureComponentTest } from '../../../testing/test-helpers';
import { PostsComponent } from './posts.component';

describe('PostsComponent', () => {
  beforeEach(async () => {
    await configureComponentTest(PostsComponent);
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(PostsComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });
});
