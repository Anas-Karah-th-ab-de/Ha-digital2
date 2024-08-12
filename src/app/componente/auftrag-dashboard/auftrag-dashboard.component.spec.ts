import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuftragDashboardComponent } from './auftrag-dashboard.component';

describe('AuftragDashboardComponent', () => {
  let component: AuftragDashboardComponent;
  let fixture: ComponentFixture<AuftragDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AuftragDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AuftragDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
