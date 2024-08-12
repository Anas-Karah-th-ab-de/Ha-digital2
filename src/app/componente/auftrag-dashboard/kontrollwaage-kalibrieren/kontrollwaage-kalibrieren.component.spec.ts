import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KontrollwaageKalibrierenComponent } from './kontrollwaage-kalibrieren.component';

describe('KontrollwaageKalibrierenComponent', () => {
  let component: KontrollwaageKalibrierenComponent;
  let fixture: ComponentFixture<KontrollwaageKalibrierenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [KontrollwaageKalibrierenComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KontrollwaageKalibrierenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
