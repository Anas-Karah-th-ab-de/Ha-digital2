import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VariableDruckdatenDetailComponent } from './variable-druckdaten-detail.component';

describe('VariableDruckdatenDetailComponent', () => {
  let component: VariableDruckdatenDetailComponent;
  let fixture: ComponentFixture<VariableDruckdatenDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [VariableDruckdatenDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VariableDruckdatenDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
