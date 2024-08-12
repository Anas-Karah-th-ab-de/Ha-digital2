import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AbweichungenComponent } from './abweichungen.component';

describe('AbweichungenComponent', () => {
  let component: AbweichungenComponent;
  let fixture: ComponentFixture<AbweichungenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AbweichungenComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AbweichungenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
