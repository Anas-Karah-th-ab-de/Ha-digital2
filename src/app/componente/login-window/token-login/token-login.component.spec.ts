import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TokenLoginComponent } from './token-login.component';

describe('TokenLoginComponent', () => {
  let component: TokenLoginComponent;
  let fixture: ComponentFixture<TokenLoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TokenLoginComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TokenLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
