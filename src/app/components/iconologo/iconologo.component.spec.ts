import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IconologoComponent } from './iconologo.component';

describe('IconologoComponent', () => {
  let component: IconologoComponent;
  let fixture: ComponentFixture<IconologoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IconologoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IconologoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
