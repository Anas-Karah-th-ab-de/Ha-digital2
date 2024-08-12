import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestSslComponent } from './test-ssl.component';

describe('TestSslComponent', () => {
  let component: TestSslComponent;
  let fixture: ComponentFixture<TestSslComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TestSslComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TestSslComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
