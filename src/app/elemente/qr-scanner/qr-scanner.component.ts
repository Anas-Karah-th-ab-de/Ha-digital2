import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-qr-scanner',
  template: `
    <div class="qr-scanner">
      <button (click)="scanQRCode()">Scan QR Code</button>
    </div>
  `,
  styleUrls: ['./qr-scanner.component.css']
})
export class QrScannerComponent {
  @Output() scanned = new EventEmitter<string>();

  scanQRCode() {
    // Dummy QR code scanning logic
    const scannedValue = '12345'; // Replace this with actual scanning logic
    this.scanned.emit(scannedValue);
  }
}
