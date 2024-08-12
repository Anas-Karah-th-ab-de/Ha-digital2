import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): Observable<boolean> {
    return this.authService.isAuthenticated().pipe(
      map(isAuth => {
        if (isAuth) {
          return true;
        } else {
          console.log('Not authenticated. Redirecting to login');
          this.router.navigate(['login']);
          return false;
        }
      }),
      catchError(err => {
        console.error('Error in AuthGuard:', err);
        this.router.navigate(['login']);
        return of(false);
      })
    );
}

}
