import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PruefungBilanzierungComponent } from './pruefung-bilanzierung.component';

describe('PruefungBilanzierungComponent', () => {
  let component: PruefungBilanzierungComponent;
  let fixture: ComponentFixture<PruefungBilanzierungComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PruefungBilanzierungComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PruefungBilanzierungComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
