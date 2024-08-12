import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VernichtungsprotokollComponent } from './vernichtungsprotokoll.component';

describe('VernichtungsprotokollComponent', () => {
  let component: VernichtungsprotokollComponent;
  let fixture: ComponentFixture<VernichtungsprotokollComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [VernichtungsprotokollComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VernichtungsprotokollComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
