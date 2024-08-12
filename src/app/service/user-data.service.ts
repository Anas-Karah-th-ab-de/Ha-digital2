import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserDataService {
  readonly httpOptions = {
    headers: new HttpHeaders({
      'PrestigePromotion': 'MA-Ak-KM-Idlib-+963-023'
    })
  };

  private baseUrl = '/api2'; // Use environment variable for base URL

  constructor(private httpClient: HttpClient) {}

  private getToken(): string {
    return localStorage.getItem('accessToken') || '';
  }

  getCurrentUserData(): Observable<User> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.getToken()}`,
      'PrestigePromotion': 'MA-Ak-KM-Idlib-+963-023'
    });

    return this.httpClient.get<User>(`${this.baseUrl}/myData`, { headers: headers });
  }

  updateUserData(user: User): Observable<User> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.getToken()}`,
      'PrestigePromotion': 'MA-Ak-KM-Idlib-+963-023'
    });

    return this.httpClient.put<User>(`${this.baseUrl}/updateMyData`, user, { headers: headers });
  }

  saveData() {
    this.httpClient.post(`${this.baseUrl}:3003/api/timeTracking`, {}, this.httpOptions).subscribe(response => {
      console.log('Daten gespeichert', response);
    });
  }

  getUserByQRCode(mitarbeiterNummer: number): Observable<Mitarbeiter> {
    return this.httpClient.get<Mitarbeiter>(`${this.baseUrl}/api/mitarbeiter/nummer/${mitarbeiterNummer}`);
  }
}

interface Mitarbeiter {
  name: string;
  status: string;
  istProjektleiter?: boolean;
  quali?: string;
}
