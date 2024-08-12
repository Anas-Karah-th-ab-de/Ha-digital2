import { Component, OnInit, AfterViewInit } from '@angular/core';
import { AuthService } from '../../../service/auth.service';
import { Router } from '@angular/router';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import initAnimation from './svgator-logo-animation.js';

@Component({
  selector: 'app-animated-login',
  templateUrl: './animated-login.component.html',
  styleUrls: ['./animated-login.component.css']
})
export class AnimatedLoginComponent implements OnInit, AfterViewInit {

  username: string = "";
  password: string = "";
  isPasswordVisible: boolean = false;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    const accessToken = localStorage.getItem('accessToken');
    const userRights = localStorage.getItem('userRights');

    if (accessToken && userRights) {
      // Wenn beides vorhanden ist, leite zum Dashboard weiter
      this.router.navigate(['/dashboard']);
    }

  
  }

  ngAfterViewInit() {
    setTimeout(() => {
      const targetElement = document.querySelector('#elementId'); // Ersetze #elementId durch das tatsächliche Element
      if (targetElement) {
        try {
          initAnimation();  // Animation starten, wenn das Element existiert
        } catch (error) {
          console.error('Error initializing animation:', error);
        }
      } else {
        console.error('Target element not found for animation.');
      }
    }, 1000); 
  }
  
  onLogin(): void {
    console.log("onLogin called");

    this.username = this.username.toLowerCase().replace(/\s+/g, '');

    this.authService.login(this.username, this.password).subscribe(
      responseData => {
        if (responseData && responseData.accessToken) {
          const userRole = this.authService.getRoleFromToken();

          if (userRole) {
            this.authService.getUserRoleWithRights().subscribe(roles => {
              const userRights = roles.find((role: { name: string, rights: string[] }) => role.name === userRole)?.rights || [];
             
              this.authService.setUserRights(userRights);
              this.router.navigate(['/dashboard']);
              this.authService.isLicenseValid1().pipe(
                map(response => {
                  if (response.isValid) {
                    return true;
                  } else {
                    this.router.navigate(['/dashboard']);
                    this.authService.logins = true;
                    return false;
                  }
                }),
                catchError(err => {
                  console.error('Error in LicenseGuard:', err);
                  this.router.navigate(['/dashboard']);
                  return of(false);
                })
              ).subscribe();
            });
          } else {
            console.error("No role found in the token");
          }

        } else {
          console.error("Invalid response:", responseData);
        }
      },
      error => {
        console.error('Fehler beim Login:', error);
        alert('Falscher Benutzername oder Passwort!');
      }
    );
  }

  togglePasswordVisibility(): void {
    this.isPasswordVisible = !this.isPasswordVisible;
    const passwordInput = document.getElementById('loginPassword') as HTMLInputElement;
    if (passwordInput) {
      passwordInput.type = this.isPasswordVisible ? 'text' : 'password';
    }
  }
}
