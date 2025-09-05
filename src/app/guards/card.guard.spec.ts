import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { cardGuard } from './card.guard';

describe('cardGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => cardGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
