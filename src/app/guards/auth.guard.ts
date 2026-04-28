import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const user = authService.getUser(); // Get the saved user object

  if (!authService.isLoggedIn()) {
    return router.parseUrl('/login');
  }

  // Check if the route requires a specific role
  const expectedRole = route.data?.['expectedRole'];
  
  if (expectedRole && user.role !== expectedRole) {
    alert("Access Denied: Admins Only!");
    return router.parseUrl('/dashboard'); // Kick them back to their dashboard
  }

  return true;
};