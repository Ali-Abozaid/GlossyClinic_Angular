import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';  // Import your AuthService

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const userData = this.authService.getUserData();

    // Check if the user is logged in
    if (userData) {
      return true;  // Allow navigation to the route
    } else {
      // Determine the route being accessed
      const url = state.url;

      // If the user is trying to access a dashboard route, redirect to '/DashboardGloosy/login'
      if (url.startsWith('/DashboardGloosy')) {
        this.router.navigate(['/DashboardGloosy/login']);  // Redirect to dashboard login page
      } else {
        // Otherwise, redirect to the main login page
        this.router.navigate(['/login']);  // Redirect to standard login page
      }

      return false;
    }
  }
}
