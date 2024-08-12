//login-window.component.ts
import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
// Andere Imports...
import { AuthService } from '../../service/auth.service';
import { Router } from '@angular/router';
import { map, catchError } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
@Component({
  selector: 'app-login-window',
  templateUrl: './login-window.component.html',
  styleUrls: ['./login-window.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginWindowComponent {
  username: string = "";
  password: string = "";
  isPasswordVisible: boolean = false;
  constructor(private authService: AuthService, private router: Router) {}
  onLogin(): void {
   
    console.log("onLogin called");
  
    this.username = this.username.toLowerCase().replace(/\s+/g, '');
  
    this.authService.login(this.username, this.password).subscribe(
      responseData => {
      //  console.log("Server response:", responseData);
  
        if (responseData && responseData.accessToken) {
          const userRole = this.authService.getRoleFromToken();
        
          if (userRole) {
            this.authService.getUserRoleWithRights().subscribe(roles => {
              const userRights = roles.find((role: { name: string, rights: string[] }) => role.name === userRole)?.rights || [];
     
              this.authService.setUserRights(userRights);
              this.router.navigate(['/dashboard']);
      
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
            });
          } else {
            console.error("No role found in the token");
          }
  
        } else {
          console.error("Invalid response:", responseData);
          // Show an error message for invalid response
        }
      },
      error => {
        console.error('Fehler beim Login:', error);
        if (error.status) {
          console.error("HTTP Status Code:", error.status);
        }
        if (error.error) {
          console.error("Server Error:", error.error);
        }
        if (error.message) {
          console.error("Error Message:", error.message);
        }
        alert('Falscher Benutzername oder Passwort!');
      }
    );
  }
  


  togglePasswordVisibility(): void {
    this.isPasswordVisible = !this.isPasswordVisible;
    let passwordInput = document.getElementById('loginPassword') as HTMLInputElement;
    passwordInput.type = this.isPasswordVisible ? 'text' : 'password';
  }

}  