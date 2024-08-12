import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, Subscription, interval, lastValueFrom } from 'rxjs';
import { tap, switchMap, map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuftragService {
  private baseUrl = '/api2'; // Use environment variable for base URL
  readonly httpOptions = {
    headers: new HttpHeaders({
      'PrestigePromotion': 'MA-Ak-KM-Idlib-+963-023'
    })
  };
  private sessionKeyAuftragsnummer: string = 'auftragsnummer';
  private orders: any[] = [];
  private collectedData: any = {};
  private sessionKeyOrders: string = 'session-orders';
  private sessionKeyCollectedData: string = 'session-collectedData';

  constructor(private http: HttpClient) {}

  cacheData(key: string, data: any) {
    localStorage.setItem(key, JSON.stringify(data));
  }
  getSchritte(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/schritte`);
  }
  getWaage(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/waage`);
  }
  
  getRaum(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/raum`);
  }
  getdruckmethode(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/druckmethode`);
  }
  getPlaetze(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/plaetze`);
  }
  getreferenceWeight(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/referenceWeight`);
  }
  getAuftragData(orderNumber: string | number): Observable<any> {
    const orderNumberStr = String(orderNumber);
    let savedOrderNumber = localStorage.getItem(this.sessionKeyAuftragsnummer);
  
    if (savedOrderNumber) {
      savedOrderNumber = savedOrderNumber.replace(/^"|"$/g, '');
    } else {
      this.cacheData('auftragsnummer', orderNumber);
      savedOrderNumber = localStorage.getItem(this.sessionKeyAuftragsnummer);
    }
  
    if (savedOrderNumber) {
      savedOrderNumber = savedOrderNumber.replace(/^"|"$/g, '');
    }
  
    console.log(`Saved: "${savedOrderNumber}", Current: "${orderNumberStr}"`);
  
    if (savedOrderNumber && savedOrderNumber !== orderNumberStr) {
      const collectedDataAttributeCount = Object.keys(this.collectedData).length;
  
      if (collectedDataAttributeCount >= 3) {
        return this.fetchAndStoreCollectedData(orderNumberStr).pipe(
          map((data) => this.sortOrdersByPos(data))
        );
      } else {
        this.clearCacheExceptEssential();
        return this.fetchAndStoreCollectedData(orderNumberStr).pipe(
          map((data) => this.sortOrdersByPos(data))
        );
      }
    } else {
      return this.fetchAndStoreCollectedData(orderNumberStr).pipe(
        map((data) => this.sortOrdersByPos(data))
      );
    }
  }
  
  private sortOrdersByPos(data: any): any {
    if (data && data.orders && Array.isArray(data.orders)) {
      data.orders.sort((a: any, b: any) => {
        const posA = parseFloat(a.pos);
        const posB = parseFloat(b.pos);
  
        return posA - posB;
      });
    }
    return data;
  }
  
  

  private fetchAndStoreCollectedData(orderNumber: string): Observable<any> {
    return this.http.get(`/api2/orders/${orderNumber}`);
  }

  clearCacheExceptEssential() {
    const essentialKeys = ['accessToken', 'userRights', 'auftragsnummer'];
    const preservedData: { [key: string]: string | null } = {};

    essentialKeys.forEach(key => {
      preservedData[key] = localStorage.getItem(key);
    });

    localStorage.clear();

    Object.keys(preservedData).forEach(key => {
      if (preservedData[key]) {
        localStorage.setItem(key, preservedData[key] as string);
      }
    });
  }

  getCachedData(key: string) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  }

  saveCollectedDataToBackend2(collectedData: any): Observable<any> {
    let orderNumber = this.getCachedData('auftragsnummer');
    orderNumber = orderNumber.replace(/"/g, '');

    const cleanedData = this.cleanData(collectedData);

    return this.http.post(`/api2/collectedData/${orderNumber}`, cleanedData, this.httpOptions);
  }

  private cleanData(obj: any): any {
    if (Array.isArray(obj)) {
      return obj.map(item => this.cleanData(item));
    } else if (obj && typeof obj === 'object') {
      if (obj.__zone_symbol__value) {
        return this.cleanData(obj.__zone_symbol__value);
      }

      const cleanedObj: any = {};
      Object.keys(obj).forEach(key => {
        if (!key.startsWith('__zone_symbol__')) {
          cleanedObj[key] = this.cleanData(obj[key]);
        }
      });
      return cleanedObj;
    }
    return obj;
  }

  setOrders(orders: any[]) {
    this.orders = orders;
    localStorage.setItem(this.sessionKeyOrders, JSON.stringify(orders));
  }

  getOrders(): any[] {
    const savedOrders = localStorage.getItem(this.sessionKeyOrders);
    return savedOrders ? JSON.parse(savedOrders) : this.orders;
  }

  clearOrders() {
    this.orders = [];
    localStorage.removeItem(this.sessionKeyOrders);
  }

  setCollectedData(collectedData: any) {
    this.collectedData = collectedData;
    this.saveCollectedDataToBackend2(collectedData).subscribe({
      next: response => console.log('Data saved successfully', response),
      error: error => console.error('Error saving data', error)
    });
  }

  async getCollectedData(): Promise<any> {
    let orderNumber = localStorage.getItem(this.sessionKeyAuftragsnummer);
    if (orderNumber) {
      orderNumber = orderNumber.replace(/"/g, '');
      const data = await lastValueFrom(this.http.get(`/api2/collectedData/${orderNumber}`).pipe(
        tap()
      ));

      return data;
    } else {
      return this.collectedData;
    }
  }

  clearCollectedData() {
    this.collectedData = {};
    localStorage.removeItem(this.sessionKeyCollectedData);
  }
}
