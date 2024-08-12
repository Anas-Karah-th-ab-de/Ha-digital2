import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PruefgewichtErmittelnComponent } from './pruefgewicht-ermitteln.component';

describe('PruefgewichtErmittelnComponent', () => {
  let component: PruefgewichtErmittelnComponent;
  let fixture: ComponentFixture<PruefgewichtErmittelnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PruefgewichtErmittelnComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PruefgewichtErmittelnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
