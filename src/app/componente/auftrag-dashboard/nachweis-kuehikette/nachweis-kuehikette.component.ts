import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { UserDataService } from '../../../service/user-data.service';
import { AuftragService } from '../auftrag.service';
import { ChangeDetectorRef } from '@angular/core';
import { AppComponent } from '../../../app.component';

interface TimeEntry {
  id: number;
  auszulagerndeMenge: number;
  auszulagerndeMengeVerified: boolean;
  auszulagerndeMengeVerifiedAt?: string;
  auszulagerndeMengeVerifierName?: string;
  einzulagerndeMenge: number;
  einzulagerndeMengeVerified: boolean;
  einzulagerndeMengeVerifiedAt?: string;
  einzulagerndeMengeVerifierName?: string;
  bemerkung: string;
}

@Component({
  selector: 'app-nachweis-kuehikette',
  templateUrl: './nachweis-kuehikette.component.html',
  styleUrls: ['./nachweis-kuehikette.component.css']
})
export class NachweisKuehiketteComponent implements OnInit {
  orders: any[] = [];
  entries: TimeEntry[] = [];
  dataSource = new MatTableDataSource<TimeEntry>(this.entries);
  displayedColumns: string[] = [
    'id', 
    'auszulagerndeMenge', 
    'einzulagerndeMenge', 
    'bemerkung', 
    'zeitAusgelagert', 

  ];
  nextId: number = 1;

  constructor(
    private appComponent: AppComponent,
    private userDataService: UserDataService,
    private auftragService: AuftragService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.appComponent.updateSectionStatus('NachweisKuehiketteComponent', 'in-progress');

    this.orders = this.auftragService.getOrders();
    this.loadExistingData();
    if (this.entries.length === 0) {
      this.addRow(); // Add the first row by default if no data exists
    }
  }

  async loadExistingData(): Promise<void> {
    const collectedData = await this.auftragService.getCollectedData();
    if (collectedData && collectedData.NachweisKuehikette) {
      this.entries = collectedData.NachweisKuehikette.map((entry: any) => ({
        ...entry,
        auszulagerndeMengeVerifiedAt: entry.auszulagerndeMengeVerifiedAt ? new Date(entry.auszulagerndeMengeVerifiedAt) : undefined,
        einzulagerndeMengeVerifiedAt: entry.einzulagerndeMengeVerifiedAt ? new Date(entry.einzulagerndeMengeVerifiedAt) : undefined
      }));
      this.dataSource.data = this.entries;

      if (this.entries.length > 0) {
        this.nextId = Math.max(...this.entries.map(entry => entry.id)) + 1;
      }
      this.updateComponentStatus();
    }
  }

  addRow(): void {
    if (this.canAddRow()) {
      this.entries.push({
        id: this.nextId++,
        auszulagerndeMenge: 0,
        auszulagerndeMengeVerified: false,
        einzulagerndeMenge: 0,
        einzulagerndeMengeVerified: false,
        bemerkung: ''
      });
      this.dataSource.data = this.entries;
      this.cdr.detectChanges(); // Trigger change detection manually
      this.updateComponentStatus();
    }
  }

  canAddRow(): boolean {
    return this.entries.length === 0 || this.entries[this.entries.length - 1].einzulagerndeMengeVerified;
  }

  verifyAuszulagerndeMenge(entry: TimeEntry): void {
    this.userDataService.getCurrentUserData().subscribe(user => {
      entry.auszulagerndeMengeVerified = true;
      entry.auszulagerndeMengeVerifiedAt = (new Date()).toISOString();
      entry.auszulagerndeMengeVerifierName = `${user.firstname} ${user.lastname}`;
      this.cdr.detectChanges(); // Trigger change detection
      this.saveData();
    });
  }

  verifyEinzulagerndeMenge(entry: TimeEntry): void {
    this.userDataService.getCurrentUserData().subscribe(user => {
      entry.einzulagerndeMengeVerified = true;
      entry.einzulagerndeMengeVerifiedAt = (new Date()).toISOString();
      entry.einzulagerndeMengeVerifierName = `${user.firstname} ${user.lastname}`;
      this.cdr.detectChanges(); // Trigger change detection
      this.saveData();
      
    });
  }

  calculateZeitAusgelagert(entry: TimeEntry): number {
    if (entry.auszulagerndeMengeVerifiedAt && entry.einzulagerndeMengeVerifiedAt) {
      const auszulagerndeMengeVerifiedDate = new Date(entry.auszulagerndeMengeVerifiedAt);
      const einzulagerndeMengeVerifiedDate = new Date(entry.einzulagerndeMengeVerifiedAt);
      const diff = einzulagerndeMengeVerifiedDate.getTime() - auszulagerndeMengeVerifiedDate.getTime();
      
      return Number((diff / (1000 * 60)).toFixed(2)); // Difference in minutes
    }
    return 0;
  }

  async saveData(): Promise<void> {
    const collectedData = await this.auftragService.getCollectedData();
    collectedData.NachweisKuehikette = this.entries; // Save directly to NachweisKuehikette
    this.auftragService.setCollectedData(collectedData);
    this.updateComponentStatus();
  }

  updateComponentStatus(): void {
    const allVerified = this.entries.every(entry => entry.auszulagerndeMengeVerified && entry.einzulagerndeMengeVerified);
    if (allVerified) {
      this.appComponent.updateSectionStatus('NachweisKuehiketteComponent', 'completed');
    } else {
      this.appComponent.updateSectionStatus('NachweisKuehiketteComponent', 'in-progress');
    }
  }

  cancel(): void {
    this.loadExistingData();
  }
}
