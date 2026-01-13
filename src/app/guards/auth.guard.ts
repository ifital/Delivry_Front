// auth.guard.ts
import { CanActivateFn, Router } from '@angular/router';
import { inject, PLATFORM_ID } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { isPlatformBrowser } from '@angular/common';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  //  SSR → laisser passer
  if (!isPlatformBrowser(platformId)) {
    return true;
  }

  if (authService.isLoggedIn()) {

    const requiredRoles = route.data?.['roles'] as string[] | undefined;

    if (requiredRoles?.length) {
      const userRole = authService.getUserRole();

      if (userRole && requiredRoles.includes(userRole)) {
        return true;
      }

      router.navigate(['/unauthorized']);
      return false;
    }

    return true;
  }

  router.navigate(['/login'], {
    queryParams: { returnUrl: state.url }
  });
  return false;
};
