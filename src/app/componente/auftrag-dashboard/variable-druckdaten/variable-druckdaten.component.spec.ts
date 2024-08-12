import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VariableDruckdatenComponent } from './variable-druckdaten.component';

describe('VariableDruckdatenComponent', () => {
  let component: VariableDruckdatenComponent;
  let fixture: ComponentFixture<VariableDruckdatenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [VariableDruckdatenComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VariableDruckdatenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
