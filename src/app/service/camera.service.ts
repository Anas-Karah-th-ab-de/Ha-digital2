import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CameraService {
  private baseUrl = ''; // Use environment variable for base URL

  constructor(private http: HttpClient) {}

  uploadPhoto(orderNumber: string, photo: string, componentName: string, row?: string): Observable<any> {
    return this.http.post(`/api2/uploadPhoto`, { orderNumber, photo, componentName, row });
  }

  getPhotos(orderNumber: string, componentName: string, row?: string): Observable<any> {
    let url = `/api2/photos/${orderNumber}/${componentName}`;
    if (row) {
      url += `/${row}`;
    }
    return this.http.get(url);
  }

  getPhotosByPaths(photoPaths: string[]): Observable<any> {
    return this.http.post(`/api2/photos`, { photoPaths });
  }

  deletePhoto(photoPath: string): Observable<any> {
    let orderNumber  = localStorage.getItem('auftragsnummer');
   
orderNumber = orderNumber?.replace(/^"|"$/g, '') || '';    
return this.http.request('delete', `/api2/photos`, { body: { photoPath ,orderNumber } });
  }
}
