import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnimatedLoginComponent } from './animated-login.component';

describe('AnimatedLoginComponent', () => {
  let component: AnimatedLoginComponent;
  let fixture: ComponentFixture<AnimatedLoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AnimatedLoginComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AnimatedLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
