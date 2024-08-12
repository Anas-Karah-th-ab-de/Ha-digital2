import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WareneingangspruefungComponent } from './wareneingangspruefung.component';

describe('WareneingangspruefungComponent', () => {
  let component: WareneingangspruefungComponent;
  let fixture: ComponentFixture<WareneingangspruefungComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [WareneingangspruefungComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WareneingangspruefungComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
