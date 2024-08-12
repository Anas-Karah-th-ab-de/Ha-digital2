import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { lizenzenGuard } from './lizenzen.guard';

describe('lizenzenGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => lizenzenGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
