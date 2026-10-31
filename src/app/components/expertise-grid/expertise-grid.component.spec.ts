import { TestBed } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';
import { configureComponentTest } from '../../../testing/test-helpers';
import { ExpertiseGridComponent } from './expertise-grid.component';

describe('ExpertiseGridComponent', () => {
  beforeEach(async () => {
    await configureComponentTest(ExpertiseGridComponent);
  });

  it('should render the nine situations in three groups', () => {
    const fixture = TestBed.createComponent(ExpertiseGridComponent);
    fixture.componentInstance.itemsKey = 'home.expertise.items';
    TestBed.inject(TranslateService).use('fr');
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;
    expect(element.querySelectorAll('.expertise-group').length).toBe(3);
    expect(element.querySelectorAll('.expertise-card').length).toBe(9);
    expect(element.querySelector('.expertise-card')?.textContent).toContain('Litiges');
    expect(element.querySelector('.expertise-group-title')?.textContent).toContain('Droit du travail');
  });
});
