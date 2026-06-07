import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const isLoggedIn = typeof window !== 'undefined' && localStorage.getItem('isLoggedIn');

  if (isLoggedIn) {
    return true;
  }

  router.navigate(['/login']);
  return false;
};

export const guestGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const isLoggedIn = typeof window !== 'undefined' && localStorage.getItem('isLoggedIn');

  if (isLoggedIn) {
    
    router.navigate(['/dashboard']);
    return false;
  }

  return true;
};

