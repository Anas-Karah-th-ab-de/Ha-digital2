import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { AuthService } from './auth.service';
import { jwtDecode } from 'jwt-decode';

@Injectable({ providedIn: 'root' })
export class ProfileGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree {
    const token: string | null = localStorage.getItem('token');
    if (!token) {
      // Redirect zum Login oder einer Fehlerseite, wenn kein Token vorhanden ist
      return this.router.createUrlTree(['/login']);
    }
    
    const decodedToken: any = jwtDecode(token);
    if (decodedToken.route === '/profile') {
      return true;
    }
    
    // Redirect zum Login oder einer Fehlerseite
    return this.router.createUrlTree(['/login']);
    
  }
}
