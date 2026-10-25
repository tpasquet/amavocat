import { TestBed } from '@angular/core/testing';
import { configureComponentTest } from '../../../testing/test-helpers';
import { PostCardComponent } from './post-card.component';

describe('PostCardComponent', () => {
  beforeEach(async () => {
    await configureComponentTest(PostCardComponent);
  });

  it('should render the post title', () => {
    const fixture = TestBed.createComponent(PostCardComponent);
    fixture.componentRef.setInput('post', {
      uid: '1', title: 'Titre', subtitle: '', description: '', authorFirstName: '', authorLastName: '',
      createdAt: '', modifiedAt: '', tags: [], featuredImage: '', featuredImageAlt: ''
    });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.card-title').textContent).toContain('Titre');
  });
});
