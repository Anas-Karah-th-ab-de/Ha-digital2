import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, tap } from 'rxjs/operators';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import { map } from 'rxjs/operators';
import { of } from 'rxjs';
import { User } from '../models/user';
import { HttpHeaders } from '@angular/common/http';

interface AuthResponse {
  auth: boolean;
  role: string;
  accessToken: string;
  rights?: string[];
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = '/api2'; // Updated to use proxy
logins=false; //
  private loggedIn = new BehaviorSubject<boolean>(false);
  private userRights: string[] = [];

  constructor(private httpClient: HttpClient) {
    const savedRights = localStorage.getItem('userRights');
    const token = localStorage.getItem('accessToken');
    if (token) {
      this.loggedIn.next(true);
    }
    if (savedRights) {
      this.userRights = JSON.parse(savedRights);
    }
  }

  login(username: string, password: string): Observable<AuthResponse> {
    const headers = new HttpHeaders({
      'PrestigePromotion': 'MA-Ak-KM-Idlib-+963-023',
    });

    return this.httpClient.post<AuthResponse>(`${this.apiUrl}/login`, { username, password }, { headers }).pipe(
      tap(response => {
        if (response && response.accessToken) {
          localStorage.setItem('accessToken', response.accessToken);
          this.loggedIn.next(true);
          this.getRoleFromToken();
        }
      }),
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    console.error('An error occurred:', error);
    return throwError('Something went wrong. Please try again later.');
  }

  getRoleFromToken(): string | null {
    const token = localStorage.getItem('accessToken');
    if (!token) return null;

    try {
      const decodedToken: any = jwtDecode(token);
      return decodedToken.role;
    } catch (e) {
      return null;
    }
  }

  hasRight(right: string): boolean {
    return this.userRights.includes(right);
  }

  logout() {
    localStorage.clear();
    this.loggedIn.next(false);
    location.reload();
  }

  isAuthenticated(): Observable<boolean> {
    return this.loggedIn.asObservable();
  }

  setUserRights(rights: string[]): void {
    this.userRights = rights;
    localStorage.setItem('userRights', JSON.stringify(rights));
  }

  getCurrentUserRights(): string[] {
    return this.userRights;
  }

  getUserRoleWithRights(): Observable<any> {
    return this.httpClient.get(`${this.apiUrl}/roles`);
  }

  isLicenseValid(): Observable<boolean> {
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + localStorage.getItem('accessToken'),
      'PrestigePromotion': 'MA-Ak-KM-Idlib-+963-023'
    });

    return this.httpClient.get<any>(`${this.apiUrl}/checkLicense`, { headers })
      .pipe(
        map(response => response.isValid),
        catchError(err => {
          console.error('Error in isLicenseValid:', err);
          return of(false);
        })
      );
  }
  isLicenseValid1(): Observable<{ isValid: boolean, expiryDate?: string }> {
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + localStorage.getItem('accessToken'),
      'PrestigePromotion': 'MA-Ak-KM-Idlib-+963-023'
    });
  
    return this.httpClient.get<{ isValid: boolean, expiryDate?: string }>(`${this.apiUrl}/checkLicense`,{ headers: headers } )
        .pipe(
            catchError(err => {
                console.error('Error in isLicenseValid:', err);
                return of({ isValid: false });  // return false if there's an error
            })
        );
  }

  uploadLicense(licenseKey: string): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + localStorage.getItem('accessToken'),
      'PrestigePromotion': 'MA-Ak-KM-Idlib-+963-023'
    });

    return this.httpClient.post(`${this.apiUrl}/updateLicense`, { licenseKey }, { headers });
  }

  requestToken(email: string): Observable<any> {
    const headers = new HttpHeaders({
      email,
      'PrestigePromotion': 'MA-Ak-KM-Idlib-+963-023'
    });
    return this.httpClient.post(`${this.apiUrl}/requestToken`, {}, { headers });
  }

  verifyToken(token: string): Observable<AuthResponse> {
    const headers = new HttpHeaders({
      'PrestigePromotion': 'MA-Ak-KM-Idlib-+963-023'
    });
    return this.httpClient.post<AuthResponse>(`${this.apiUrl}/verifyToken`, {}, { headers }).pipe(
      tap(response => {
        if (response && response.accessToken) {
          localStorage.setItem('accessToken', response.accessToken);
          this.loggedIn.next(true);
        }
      }),
      catchError(this.handleError)
    );
  }

  setCredentials(username: string, password: string): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + localStorage.getItem('accessToken'),
      'PrestigePromotion': 'MA-Ak-KM-Idlib-+963-023'
    });
    return this.httpClient.post(`${this.apiUrl}/setCredentials`, { username, password }, { headers });
  }

  loginWithToken(token: string): Observable<AuthResponse> {
    return this.httpClient.get<AuthResponse>(`${this.apiUrl}/login/${token}`).pipe(
      tap(response => {
        if (response && response.accessToken) {
          localStorage.setItem('accessToken', response.accessToken);
          this.loggedIn.next(true);
        }
      }),
      catchError(this.handleError)
    );
  }
}
