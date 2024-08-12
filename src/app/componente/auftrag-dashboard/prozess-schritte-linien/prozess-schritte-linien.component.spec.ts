import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProzessSchritteLinienComponent } from './prozess-schritte-linien.component';

describe('ProzessSchritteLinienComponent', () => {
  let component: ProzessSchritteLinienComponent;
  let fixture: ComponentFixture<ProzessSchritteLinienComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProzessSchritteLinienComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProzessSchritteLinienComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
