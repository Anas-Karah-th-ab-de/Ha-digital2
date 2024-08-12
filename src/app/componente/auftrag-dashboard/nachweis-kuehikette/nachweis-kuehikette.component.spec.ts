import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NachweisKuehiketteComponent } from './nachweis-kuehikette.component';

describe('NachweisKuehiketteComponent', () => {
  let component: NachweisKuehiketteComponent;
  let fixture: ComponentFixture<NachweisKuehiketteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NachweisKuehiketteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NachweisKuehiketteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
