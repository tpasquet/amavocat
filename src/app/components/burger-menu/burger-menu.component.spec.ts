import { TestBed } from '@angular/core/testing';
import { configureComponentTest } from '../../../testing/test-helpers';
import { BurgerMenuComponent } from './burger-menu.component';

describe('BurgerMenuComponent', () => {
  beforeEach(async () => {
    await configureComponentTest(BurgerMenuComponent);
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(BurgerMenuComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });
});
