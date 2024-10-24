import { isPlatformBrowser } from '@angular/common';
import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const dashboardGuard: CanActivateFn = (route, state) => {
  
  const platform = inject(PLATFORM_ID);
  const router = inject(Router);
  const authService = inject(AuthService);

  if (isPlatformBrowser(platform)) {
    const token = localStorage.getItem("eToken");
    const userData = authService.getUserData();

    if (token && userData && userData.role !== "User") {
      return true;
    } else {
      router.navigate(['/DashboardGloosy/login']);
      return false;
    }
  } else {
    return false;
  }
};