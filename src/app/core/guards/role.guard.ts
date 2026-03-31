import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { Role } from '../models/role.model';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const allowedRoles = (route.data?.['roles'] as Role[] | undefined) ?? [];

  if (!authService.isAuthenticated()) {
    return router.createUrlTree(['/auth/login']);
  }

  const currentRole = authService.currentRole();
  if (!currentRole) {
    return router.createUrlTree(['/auth/login']);
  }

  if (!allowedRoles.length || allowedRoles.includes(currentRole)) {
    return true;
  }

  return router.createUrlTree(['/projects']);
};
