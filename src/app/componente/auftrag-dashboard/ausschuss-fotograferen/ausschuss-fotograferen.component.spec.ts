import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AusschussFotograferenComponent } from './ausschuss-fotograferen.component';

describe('AusschussFotograferenComponent', () => {
  let component: AusschussFotograferenComponent;
  let fixture: ComponentFixture<AusschussFotograferenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AusschussFotograferenComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AusschussFotograferenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
