// nfc.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NfcService {
  private nfcAvailable: boolean = 'NFC' in navigator && 'NDEFReader' in window;
  private cardUid = new BehaviorSubject<string | null>(null);

  constructor() {
    if (this.nfcAvailable) {
      console.log('NFC is supported');
    } else {
      console.warn('NFC is not supported on this device.');
    }
  }

  startNfcScan(): void {
    if (this.nfcAvailable) {
      const reader = new (window as any).NDEFReader();
      reader.scan().then(() => {
        reader.addEventListener('reading', (event: any) => {
          const { serialNumber } = event;
          this.cardUid.next(serialNumber);
        });
      }).catch((error: any) => {
        console.error('Error starting NFC scan:', error);
      });
    } else {
      console.warn('NFC is not supported on this device.');
      // Fallback option here
    }
  }

  getCardUid(): Observable<string | null> {
    return this.cardUid.asObservable();
  }
}
