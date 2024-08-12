import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, Subscription, interval, lastValueFrom } from 'rxjs';
import { HttpHeaders } from '@angular/common/http';
import { tap, switchMap, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuftragService {
  private baseUrl = 'http://kmapp.prestigepromotion.de:3910';
  readonly httpOptions = {
    headers: new HttpHeaders({
      'PrestigePromotion': 'MA-Ak-KM-Idlib-+963-023'
    })
  };

  private orders: any[] = [];
  private collectedData: any = {};
  private sessionKeyOrders: string = 'session-orders';
  private sessionKeyCollectedData: string = 'session-collectedData';
  private sessionKeyCollectedDataVersion: string = 'session-collectedData-version';
  private sessionKeyAuftragsnummer: string = 'auftragsnummer';
  private version: number = 1;
  private backupInterval: Subscription | null = null;

  constructor(private http: HttpClient) {
    this.startBackupInterval();
  }

  getAuftragData(orderNumber: string): Observable<any> {
    const savedOrderNumber = localStorage.getItem(this.sessionKeyAuftragsnummer);

    if (savedOrderNumber && savedOrderNumber !== orderNumber) {
      return this.saveCollectedDataToBackend(this.collectedData).pipe(
        switchMap(() => {
          this.clearCacheExceptEssential();
          return this.fetchAndStoreCollectedData(orderNumber);
        })
      );
    } else {
      return this.fetchAndStoreCollectedData(orderNumber);
    }
  }

  private fetchAndStoreCollectedData(orderNumber: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/api/orders/${orderNumber}`);

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
    this.version += 1;
    localStorage.setItem(this.sessionKeyCollectedData, JSON.stringify(collectedData));
    localStorage.setItem(this.sessionKeyCollectedDataVersion, this.version.toString());
    this.checkLocalStorageSpace();
  }
  async getCollectedData1(): Promise<any> {
    const orderNumber = localStorage.getItem(this.sessionKeyAuftragsnummer);
    if (orderNumber) {
      const data = await lastValueFrom(this.http.get(`${this.baseUrl}/api/collectedData/${orderNumber}`).pipe(
        tap(data => this.setCollectedData(data))
      ));
      return data;
    } else {
      return this.collectedData;
    }
  }
  getCollectedData(): any {
    this. getCollectedData1();
    const savedCollectedData = localStorage.getItem(this.collectedData);
    return savedCollectedData ? JSON.parse(savedCollectedData) : this.collectedData;
  }


  clearCollectedData() {
    this.collectedData = {};
    localStorage.removeItem(this.sessionKeyCollectedData);
    localStorage.removeItem(this.sessionKeyCollectedDataVersion);
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

  getSessionKeyOrders(): string {
    return this.sessionKeyOrders;
  }

  getSessionKeyCollectedData(): string {
    return this.sessionKeyCollectedData;
  }

  updateOrder(updatedOrder: any): void {
    const index = this.orders.findIndex(order => order.rohwarepackmittel_artnr === updatedOrder.rohwarepackmittel_artnr);
    if (index !== -1) {
      this.orders[index] = updatedOrder;
      this.setOrders(this.orders);
    }
  }

  saveOrdersToBackend(orders: any[]) {
    this.setOrders(orders);
  }
  getCachedData(key: string) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  }

  saveCollectedDataToBackend( collectedData: any): Observable<any> {
    const orderNumber = this.getCachedData('auftragsnummer');
    return this.http.post(`${this.baseUrl}/api/collectedData/${orderNumber}`, collectedData, this.httpOptions);
  }
  

  checkLocalStorageSpace() {
    const threshold = 5 * 1024 * 1024; // 5 MB limit for localStorage
    let currentSize = 0;

    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        currentSize += localStorage[key].length;
      }
    }

    if (currentSize >= threshold) {
      this.handleStorageFull();
    }
  }

  handleStorageFull() {
    const essentialKeys = ['accessToken', 'userRights', 'auftragsnummer'];
    const preservedData: { [key: string]: string | null } = {};

    essentialKeys.forEach(key => {
      preservedData[key] = localStorage.getItem(key);
    });

    this.saveCollectedDataToBackend(this.collectedData).subscribe();

    localStorage.clear();

    Object.keys(preservedData).forEach(key => {
      if (preservedData[key]) {
        localStorage.setItem(key, preservedData[key] as string);
      }
    });
  }

  startBackupInterval(): void {
    this.backupInterval = interval(10000).subscribe(() => {
      this.saveCollectedDataToBackend(this.collectedData).subscribe();
    });
  }

  stopBackupInterval(): void {
    if (this.backupInterval) {
      this.backupInterval.unsubscribe();
      this.backupInterval = null;
    }
  }
}
