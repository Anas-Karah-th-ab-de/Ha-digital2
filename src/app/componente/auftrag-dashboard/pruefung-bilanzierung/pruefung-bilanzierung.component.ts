import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { UserDataService } from '../../../service/user-data.service';
import { AuftragService } from '../auftrag.service';
import { AbweichungenComponent } from '../../abweichungen/abweichungen.component';
import { AppComponent } from '../../../app.component';
import { CameraService } from '../../../service/camera.service';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-pruefung-bilanzierung',
  templateUrl: './pruefung-bilanzierung.component.html',
  styleUrls: ['./pruefung-bilanzierung.component.css']
})
export class PruefungBilanzierungComponent implements OnInit {
  orders: any[] = [];
  collectedData: any = {};
  displayedColumns: string[] = [
    'rohwarepackmittel_artnr',
   
    'rohwarepackmittel_bezeichnung',
    'rohwareCharge',
    'pmCharge',
    'rohwaredruckdatum',
    'produktionsMenge',
    'ppMishandling',
    'extReason',
  ];
  tamperEvidentOptions: string[] = ['TamperEvident', 'Option 1', 'Option 2', 'Option 3'];

  abweichungenPhotos: string[] = [];
  abweichungenText: string = '';
  bemerkungPhotos: string[] = [];
  bemerkungText: string = '';
  allChecked: boolean = false;

  constructor(
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog,
    private userDataService: UserDataService,
    private orderService: AuftragService,
    private appComponent: AppComponent,
    private cameraService: CameraService
  ) {}

  async ngOnInit(): Promise<void> {
    this.orders = this.orderService.getOrders();
    const data = await this.orderService.getCollectedData();
    if (data?.PruefungBilanzierung?.length < 0) {
      this.collectedData = data || { PruefungBilanzierung: [] };
    }
    this.collectedData = data;
    this.loadVerificationData();
    this.updateComponentStatus();
  }

  async saveInputChanges(order: any, field: string, value: any): Promise<void> {
    const collectedData = await this.orderService.getCollectedData();
    this.collectedData = collectedData;

    if (collectedData.posData) {
      const posIndex = collectedData.posData.findIndex((posData: any) => posData.pos === order.pos);
      if (posIndex !== -1) {
        if (!collectedData.posData[posIndex].PruefungBilanzierung) {
          collectedData.posData[posIndex].PruefungBilanzierung = {};
        }
        collectedData.posData[posIndex].PruefungBilanzierung[field] = value;
      }
      this.orderService.setCollectedData(collectedData);
      this.updateComponentStatus();
    }
  }

  pruefen(): void {
    this.userDataService.getCurrentUserData().subscribe(user => {
      const reviewerName = user.firstname + ' ' + user.lastname;
      const timestamp = new Date().toISOString();

      const pruefungResult = {
        reviewer: reviewerName,
        checkedAt: timestamp,
        status: 'geprüft'
      };

      this.savePruefungResult(pruefungResult);
      this.updateComponentStatus();
    });
  }

  async savePruefungResult(pruefungResult: any): Promise<void> {
    const collectedData = await this.orderService.getCollectedData();
    if (!collectedData.PruefungBilanzierung) {
      collectedData.PruefungBilanzierung = [];
    }

    collectedData.PruefungBilanzierung[0] = pruefungResult; // Ensures only one result is saved
    this.orderService.setCollectedData(collectedData);
    this.collectedData.PruefungBilanzierung[0]= pruefungResult;
    this.loadVerificationData();
    this.updateComponentStatus();
  
    this.cdr.detectChanges();
  }

  isChecked(): boolean {
    // Gute Überprüfung auf Existenz vor dem Zugriff
    return this.collectedData?.PruefungBilanzierung?.[0]?.status === 'geprüft';
  }
  
  

  async loadVerificationData(): Promise<void> {
    const collectedData = this.collectedData;
    const pruefungBilanzierung = collectedData.PruefungBilanzierung || {};

    this.abweichungenPhotos = pruefungBilanzierung.abweichungen?.photos || [];
    this.abweichungenText = pruefungBilanzierung.abweichungen?.text || '';
    this.bemerkungPhotos = pruefungBilanzierung.bemerkung?.photos || [];
    this.bemerkungText = pruefungBilanzierung.bemerkung?.text || '';

    if (this.abweichungenPhotos.length > 0) {
      try {
        const response = await lastValueFrom(this.cameraService.getPhotosByPaths(this.abweichungenPhotos));
        if (response.photos) {
          this.abweichungenPhotos = response.photos.map((photo: any) => photo.base64);
        }
      } catch (error) {
        console.error('Error loading abweichungen photos:', error);
      }
    }

    if (this.bemerkungPhotos.length > 0) {
      try {
        const response = await lastValueFrom(this.cameraService.getPhotosByPaths(this.bemerkungPhotos));
        if (response.photos) {
          this.bemerkungPhotos = response.photos.map((photo: any) => photo.base64);
        }
      } catch (error) {
        console.error('Error loading bemerkung photos:', error);
      }
    }

    if (collectedData.posData) {
      this.orders.forEach(order => {
        const posData = collectedData.posData.find((posData: any) => posData.pos === order.pos);
        if (posData && posData.PruefungBilanzierung) {
          order.rohwarepackmittel_artnr = posData.PruefungBilanzierung.rohwarepackmittel_artnr !== undefined ? posData.PruefungBilanzierung.rohwarepackmittel_artnr : order.rohwarepackmittel_artnr;
          order.produktionsMenge = posData.PruefungBilanzierung.produktionsMenge !== undefined ? posData.PruefungBilanzierung.produktionsMenge : order.produktionsMenge;
          order.ppMishandling = posData.PruefungBilanzierung.ppMishandling !== undefined ? posData.PruefungBilanzierung.ppMishandling : order.ppMishandling;
          order.extReason = posData.PruefungBilanzierung.extReason !== undefined ? posData.PruefungBilanzierung.extReason : order.extReason;
        }
      });
    }
  }

  async openDialog(type: string): Promise<void> {
    const collectedData = await this.orderService.getCollectedData();
    const dialogRef = this.dialog.open(AbweichungenComponent, {
      width: '1500px',
      data: {
        type,
        orderNumber: this.orderService.getCachedData('auftragsnummer').replace(/"/g, ''),
        componentName: 'PruefungBilanzierungComponent',
        text: collectedData.PruefungBilanzierung?.[type]?.text || '', // Pass existing text if available
        photoPaths: collectedData.PruefungBilanzierung?.[type]?.photos || []
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (!collectedData.PruefungBilanzierung) {
          collectedData.PruefungBilanzierung = {};
        }

        if (!collectedData.PruefungBilanzierung[type]) {
          collectedData.PruefungBilanzierung[type] = { photos: [], text: '' };
        }

        // Add new photos to existing ones
        const existingPhotos = collectedData.PruefungBilanzierung[type].photos || [];
        const newPhotos = result.photos.filter((photo: string) => !existingPhotos.includes(photo));
        collectedData.PruefungBilanzierung[type].photos=newPhotos;

        // Combine new text with existing one, ensure a space before adding new text
        if (result.text) {
          collectedData.PruefungBilanzierung[type].text = result.text;
        }

        // Handle deleted photos
        if (result.deletedPhotos) {
          collectedData.PruefungBilanzierung[type].photos = collectedData.PruefungBilanzierung[type].photos.filter(
            (path: string) => !result.deletedPhotos.includes(path)
          );
        }

        this.orderService.setCollectedData(collectedData);
        this.collectedData = collectedData;
        this.loadVerificationData();
        this.cdr.detectChanges();
      }
    });
  }

  async deletePhoto(index: number, type: string): Promise<void> {
    const collectedData = await this.orderService.getCollectedData();
    if (collectedData.PruefungBilanzierung[type]?.photos) {
      collectedData.PruefungBilanzierung[type].photos.splice(index, 1);

      this.orderService.setCollectedData(collectedData);
      this.collectedData = collectedData;
      this.loadVerificationData();
      this.cdr.detectChanges();
      this.loadVerificationData();
    }
  }

  async save(): Promise<void> {
    const collectedData = await this.orderService.getCollectedData();
    if (collectedData.posData) {
      this.orders.forEach(order => {
        const posData = collectedData.posData.find((posData: any) => posData.pos === order.pos);
        if (posData) {
          posData.PruefungBilanzierung = {
            ...posData.PruefungBilanzierung,
            ...order.PruefungBilanzierung
          };
        }
      });
      this.orderService.setCollectedData(collectedData);
    }
  }

  cancel(): void {
    this.orders = JSON.parse(JSON.stringify(this.orderService.getOrders()));
    this.orderService.setOrders(this.orders);
  }

  updateComponentStatus(): void {
    // Annahme: PruefungBilanzierung ist ein Array von Ergebnissen
    const firstPruefung = this.collectedData?.PruefungBilanzierung?.[0];
  
    if (firstPruefung) {
      const allChecked = firstPruefung.status === 'geprüft';
      if (allChecked) {
        this.allChecked = true;
        this.appComponent.updateSectionStatus('PruefungBilanzierungComponent', 'completed');
      } else {
        this.allChecked = false;
        this.appComponent.updateSectionStatus('PruefungBilanzierungComponent', 'in-progress');
      }
    } else {
      // Sicherstellen, dass Standardwerte gesetzt sind, wenn keine Daten vorhanden sind
      this.allChecked = false;
      this.appComponent.updateSectionStatus('PruefungBilanzierungComponent', 'in-progress');
    }
  }
  
}
