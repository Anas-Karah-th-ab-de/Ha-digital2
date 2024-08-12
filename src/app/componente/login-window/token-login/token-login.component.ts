import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../service/auth.service';
import { Route, ActivatedRoute,Router } from '@angular/router';

@Component({
  selector: 'app-token-login',
  templateUrl: './token-login.component.html',
  styleUrls: ['./token-login.component.css']
})
export class TokenLoginComponent implements OnInit {

  constructor(private authService: AuthService, private router: Router, private route: ActivatedRoute) {}

  ngOnInit() {
      const token = this.route.snapshot.params['token'];
     // console.log("Empfangener Token:", token);

      this.authService.loginWithToken(token).subscribe(
          responseData => {
            //console.log(responseData)
              // Verarbeiten Sie die Antwort wie in Ihrer vorherigen `onLogin`-Methode
              this.router.navigate(['/profile']).then(success => {
                if (!success) {
                  console.error('Navigation to /profile failed!');
                  this.router.navigate(['/login'])
                }
              });
                  if (responseData && responseData.accessToken) {
                  const userRole = this.authService.getRoleFromToken();
                  
                  if (userRole) {
                    this.authService.getUserRoleWithRights().subscribe(roles => {
                      const userRights = roles.find((role: { name: string, rights: string[] }) => role.name === userRole)?.rights || [];
                    
                      this.authService.setUserRights(userRights);
                      this.router.navigate(['/profile']);
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
                this.router.navigate(['/login'])
              
              }
            );
          }
}