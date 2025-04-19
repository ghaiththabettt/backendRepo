import { inject } from '@angular/core';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../service/auth.service';

export const AuthGuard = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  if (authService.currentUserValue) {
    const userRole = authService.currentUserValue.role;
    if (route.data['role'] && route.data['role'].indexOf(userRole) === -1) {
      router.navigate(['/authentication/signin']);
      return false;
    }
    return true;
  }

  router.navigate(['/authentication/signin']);
  return false;
};
