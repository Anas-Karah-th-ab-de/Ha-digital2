import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { AuthService } from './auth.service'; 

import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class LicenseGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> {
      return this.authService.isLicenseValid1().pipe(
        map(response => {
          if (response.isValid) {
            return true;
          } else {
            this.router.navigate(['/dashboard']);
            return false;
          }
        }),
        catchError(err => {
          console.error('Error in LicenseGuard:', err);
          this.router.navigate(['/dashboard']);
          return of(false);
        })
      );
}

}
