import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { UserDataService } from '../../../service/user-data.service';
import { AuftragService } from '../auftrag.service';
import { ChangeDetectorRef } from '@angular/core';
import { AppComponent } from '../../../app.component';

interface Entry {
  id: number;
  pos: number;
  verified: boolean;
  verifierName?: string;
  verifiedAt?: string;
}

@Component({
  selector: 'app-wareneingangspruefung',
  templateUrl: './wareneingangspruefung.component.html',
  styleUrls: ['./wareneingangspruefung.component.css']
})
export class WareneingangspruefungComponent implements OnInit {
  orders: any[] = [];
  selectedOrder: any;
  entries: Entry[] = [];
  dataSource = new MatTableDataSource<Entry>(this.entries);
  displayedColumns: string[] = ['id', 'geprueft'];
  nextIdMap: { [pos: number]: number } = {};  // Speichert die nächste ID für jede Position

  constructor(
    private userDataService: UserDataService,
    private auftragService: AuftragService,
    private cdr: ChangeDetectorRef,
    private appComponent: AppComponent
  ) {}

  ngOnInit(): void {
    this.orders = this.auftragService.getOrders();
    if (this.orders.length > 0) {
      this.selectedOrder = this.orders[0];
      this.loadExistingData();
    }
    this.appComponent.updateSectionStatus('WareneingangspruefungComponent', 'in-progress');
  }

  onOrderChange(): void {
    this.loadExistingData();
  }

  async loadExistingData(): Promise<void> {
    try {
      // Wait for the promise to resolve to get the collected data
      const collectedData = await this.auftragService.getCollectedData();
      
      // Check if specific order position data exists and retrieve it
      const orderData = collectedData.posData?.[this.selectedOrder.pos]?.Wareneingangspruefung;
      
      // Initialize entries with the order data or an empty array if undefined
      this.entries = orderData || [];
      
      // Set the data source for the Angular Material table
      this.dataSource.data = this.entries;
      
      // Update additional component states
      this.updateNextId(); // Update the nextId value based on the selected order
      this.updateComponentStatus(); // Update the component status or other UI elements as needed
    } catch (error) {
      console.error('Error while loading existing data:', error);
      // Handle errors appropriately, perhaps setting default values or showing an error message
    }
  }
  

  updateNextId(): void {
    if (this.entries.length > 0) {
      this.nextIdMap[this.selectedOrder.pos] = Math.max(...this.entries.map(entry => entry.id)) + 1;
    } else {
      this.nextIdMap[this.selectedOrder.pos] = 1; // Setze nextId auf 1, wenn keine Einträge vorhanden sind
    }
  }

  addRow(): void {
    const nextId = this.nextIdMap[this.selectedOrder.pos] || 1;
    this.entries.push({
      id: nextId,
      pos: this.selectedOrder.pos,
      verified: false
    });
    this.nextIdMap[this.selectedOrder.pos] = nextId + 1;
    this.dataSource.data = this.entries;
    this.cdr.detectChanges();
    this.appComponent.updateSectionStatus('WareneingangspruefungComponent', 'in-progress');
  }

  verifyEntry(entry: Entry): void {
    this.userDataService.getCurrentUserData().subscribe(user => {
      entry.verified = true;
      entry.verifierName = `${user.firstname} ${user.lastname}`;
      entry.verifiedAt = new Date().toISOString(); // No need to convert to ISO string format
      this.cdr.detectChanges();
      this.updateComponentStatus();
      this.saveData();
    });
  }
  async saveData(): Promise<void> {
    try {
      const collectedData = await this.auftragService.getCollectedData();
      if (collectedData && collectedData.posData && this.selectedOrder && collectedData.posData[this.selectedOrder.pos]) {
        collectedData.posData[this.selectedOrder.pos].Wareneingangspruefung = this.entries;
        console.log(collectedData)
      }
      this.auftragService.setCollectedData(collectedData);
      this.updateComponentStatus();
    } catch (error) {
      console.error('Failed to save data:', error);
    }
  }
  
  
  cancel(): void {
    this.loadExistingData();
  }

  updateComponentStatus(): void {
    const allVerified = this.entries.every(entry => entry.verified);
    if (allVerified) {
      this.appComponent.updateSectionStatus('WareneingangspruefungComponent', 'completed');
    } else {
      this.appComponent.updateSectionStatus('WareneingangspruefungComponent', 'in-progress');
    }
  }
}
