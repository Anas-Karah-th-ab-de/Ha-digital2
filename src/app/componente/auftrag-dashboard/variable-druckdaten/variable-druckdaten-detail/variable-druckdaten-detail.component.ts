import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { UserDataService } from '../../../../service/user-data.service';
import { AuftragService } from '../../auftrag.service';
import { AbweichungenComponent } from '../../../abweichungen/abweichungen.component';
import { CameraService } from '../../../../service/camera.service';
import { lastValueFrom, window } from 'rxjs';
import { ChangeDetectorRef } from '@angular/core';
import { Location } from '@angular/common';
interface Machine {
  id: number;
  name: string;
}
declare global {
  interface Window {
      FB:any;
  }
}
@Component({
  selector: 'app-variable-druckdaten-detail',
  templateUrl: './variable-druckdaten-detail.component.html',
  styleUrls: ['./variable-druckdaten-detail.component.css']
})
export class VariableDruckdatenDetailComponent implements OnInit {
  pos: any;
  positionData: any = {};
  machines: Machine[] = [
    { id: 1, name: 'Machine 1' },
    { id: 2, name: 'Machine 2' },
    { id: 3, name: 'Machine 3' }
  ];   rooms: Machine[] = [
    { id: 1, name: 'Room 1' },
    { id: 2, name: 'Room 2' },
    { id: 3, name: 'Room 3' }
  ]; 
  printMethods: Machine[] = [
    { id: 1, name: 'printMethod 1' },
    { id: 2, name: 'printMethod 2' },
    { id: 3, name: 'printMethod 3' }
  ]; 
  selectedPositions: any[] = ['pos1', 'pos2', 'pos3'];
  collectedData: any = {};
 

  constructor(
    private location: Location,

    private cdr: ChangeDetectorRef,
    private cameraService: CameraService,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private userDataService: UserDataService,
    private auftragService: AuftragService
  ) {  
  }

  ngOnInit(): void {
    this.auftragService.getPlaetze().subscribe(data => {this.machines = data})
    this.auftragService.getRaum().subscribe(data => {this.rooms = data})
    this.auftragService.getdruckmethode().subscribe(data => {this.printMethods = data})
    const data = this.auftragService.getCollectedData();
    this.route.params.subscribe(params => {
      this.pos = params['pos'];
      if (data instanceof Promise) {
        data.then(collectedData => {
        //  console.log(collectedData);
          this.collectedData = structuredClone(collectedData); // Create a copy here

          this.loadPosition(this.pos);
        });
      } else {
      
        this.collectedData = structuredClone(data); // Create a copy here
        this.loadPosition(this.pos);
      }
    });
  }

  async loadPosition(pos: any): Promise<void> {
    
    this.pos =  Number(pos);
    const posIndex = Number(pos);
    
    try {
      const collectedData = await this.auftragService.getCollectedData() ;
      const matchingEntry = collectedData.posData.find((entry:any) => entry.pos === posIndex);
  console.log(matchingEntry)
      if (matchingEntry) {
        this.positionData = matchingEntry;
      } else if (collectedData.posData[posIndex]) {
        this.positionData = collectedData.posData[posIndex];
      } else {
        this.positionData = {};
      }

      //console.log('Loaded position data:', this.positionData);
  
      // Check and load photos if available
      if (this.positionData.photos && this.positionData.photos.length > 0) {
        const response = await lastValueFrom(this.cameraService.getPhotosByPaths(this.positionData.photos));
        if (response && response.photos) {
          this.positionData.photos = response.photos.map((photo: any) => photo.base64);
          this.cdr.detectChanges();
        }
      }
    } catch (error) {
      console.error('Error loading position data:', error);
    }
  }
  

  verifyFirst(field: string): void {
    this.positionData[field] = { disabled: true }; // Disable the button immediately
    this.userDataService.getCurrentUserData().subscribe(user => {
      this.positionData[field] = {
        name: `${user.firstname} ${user.lastname}`,
        timestamp: new Date().toISOString()
      };
      this.checkAllVerificationsCompleted();
    });
  }

  verifySecond(field: string): void {
    const codeField = field + 'Code';
    if (this.positionData[codeField]) {
      const processedCode = this.positionData[codeField].startsWith('99') ? this.positionData[codeField].substring(2) : this.positionData[codeField];
      this.positionData[field + 'Disabled'] = true; // Disable the input field immediately

      this.userDataService.getUserByQRCode(processedCode).subscribe(user => {
        if (this.positionData.firstVerifier && this.positionData.firstVerifier.name === user.name) {
          alert('The second verifier cannot be the same as the first verifier.');
          return;
        }
        this.positionData[field] = {
          name: user.name,
          timestamp: new Date().toISOString()
        };
        this.positionData[codeField] = ''; // Clear the code field after verification
        this.checkAllVerificationsCompleted();
      });
    }
  }

  checkAllVerificationsCompleted(): void {
    if (this.positionData.secondVerifier && this.positionData.maschineVerifier && this.positionData.pruefmusterVerifier) {
      this.positionData.isConfirmed = true;
    }
  }
  reload() {
   
     location.reload();
    
  }
  
  openDialog(): void {
    const posIndex = Number(this.pos);
    const matchingEntryIndex = this.collectedData.posData.findIndex((entry:any) => Number(entry.pos) === posIndex);
    const positionData = this.collectedData?.posData[matchingEntryIndex];
    const photoPaths = positionData?.photos || [];  // Stelle sicher, dass dies immer ein Array ist
  
    const dialogRef = this.dialog.open(AbweichungenComponent, {
      width: '1500px',
      data: { 
        type: 'photo',
        orderNumber: this.auftragService.getCachedData('auftragsnummer').replace(/"/g, ''),
        rowData: this.pos,
        componentName: 'PruefungBilanzierungComponent' + this.pos,
        photoPaths: photoPaths,
        text: positionData?.text || ''
      }
    });
  
    dialogRef.afterClosed().subscribe(async result => {
      if (result && result.photos && result.photos.length > 0) {
        this.positionData.photos = []; // Setze photos immer zurück, bevor neue hinzugefügt werden
        this.positionData.photos=result.photos // Füge alle neuen Fotos hinzu
        console.log(this.positionData); //

        await this.save(); // Speichere die neuen Daten
        try {
          const response = await lastValueFrom(this.cameraService.getPhotosByPaths(this.positionData.photos));
          if (response && Array.isArray(response.photos)) {
            this.positionData.photos = response.photos.map((photo:any) => photo.base64);
          } else {
            this.positionData.photos = [];
            console.error('Response does not contain an array of photos:', response);
          }
        } catch (error) {
          console.error('Error fetching photos:', error);
          this.positionData.photos = [];
        }
        

        await this.loadPosition(this.pos);
        this.cdr.detectChanges();
this. ngOnInit()
      }
    });
  }
  

  deletePhoto(index: number): void {
    const posIndex = Number(this.pos);
    const matchingEntryIndex = this.collectedData.posData.findIndex((entry:any) => Number(entry.pos) === posIndex);

    const positionDataphtos = this.collectedData.posData[matchingEntryIndex].photos || {};

    if (positionDataphtos) {

      const photoToDelete = positionDataphtos[index];
      console.log(photoToDelete)
      this.cameraService.deletePhoto(photoToDelete).subscribe({
        next: () => {
          this.positionData.photos.splice(index, 1);

          this.save(); // Save after deleting a photo
        
           this.loadPosition(this.pos);
          this.cdr.detectChanges();
          this. ngOnInit()
        },
        error: (err) =>{ console.error('Error deleting photo:', err)
      this.reload()
        },
        
      });
    }

  }

  async save(): Promise<void> {
    try {
      const collectedData = await this.auftragService.getCollectedData() ;
      const posIndex = Number(this.pos);
      const matchingEntryIndex = collectedData.posData.findIndex((entry:any) => Number(entry.pos) === posIndex);
  
      if (matchingEntryIndex !== -1) {
        // Update the existing entry
        collectedData.posData[matchingEntryIndex] = this.positionData;
      } else {
        // Optional: Handle the case where no matching entry is found
        console.error('No matching entry found for position:', this.pos);
        return;
      }
  
       this.auftragService.setCollectedData(collectedData); // Persist changes
      this.cdr.detectChanges();
   
    } catch (error) {
      console.error('Failed to save data:', error);
    }
  }

  cancel(): void {
    this.loadPosition(this.pos);
  }
}
