import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class RightsGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const requiredRight = route.data['requiredRight'];
    if (this.authService.hasRight('review')) {
      return true;
  } else if (this.authService.hasRight('creator')) {
      // Nur wenn 'review' nicht vorhanden ist, prüfe 'creator'
      return true;
  }
   console.log('requiredRight', requiredRight);
  
    if (!requiredRight) {
      console.error('No required right defined for this route.');
      return false;
    }
  
    if (this.authService.hasRight(requiredRight)) {
      return true;
    } else {
      this.router.navigate(['/dashboard']);
      return false;
    }
  }
  
}
