import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { CardService } from '../services/card.service';

export const hasCardGuard: CanActivateFn = () => {
  const svc = inject(CardService);
  const router = inject(Router);
  if (svc.hasCard()) return true;
  router.navigate(['/']);
  return false;
};