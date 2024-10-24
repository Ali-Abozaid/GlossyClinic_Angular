import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { forgetGuard } from './forget.guard';

describe('forgetGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => forgetGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
