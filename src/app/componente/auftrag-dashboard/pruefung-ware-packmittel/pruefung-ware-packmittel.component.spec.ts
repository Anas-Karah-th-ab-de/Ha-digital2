import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PruefungWarePackmittelComponent } from './pruefung-ware-packmittel.component';

describe('PruefungWarePackmittelComponent', () => {
  let component: PruefungWarePackmittelComponent;
  let fixture: ComponentFixture<PruefungWarePackmittelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PruefungWarePackmittelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PruefungWarePackmittelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
