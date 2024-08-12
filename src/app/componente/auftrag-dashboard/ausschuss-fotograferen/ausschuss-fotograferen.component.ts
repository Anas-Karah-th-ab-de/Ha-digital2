import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { AbweichungenComponent } from '../../abweichungen/abweichungen.component';
import { UserDataService } from '../../../service/user-data.service';
import { AuftragService } from '../auftrag.service';
import { ChangeDetectorRef } from '@angular/core';
import { AppComponent } from '../../../app.component';

interface Machine {
  id: number;
  name: string;
}

interface TimeEntry {
  id: string;
  id2: string;
  time: string;
  samples: number;
  deviation: boolean;
  verified: boolean;
  verifierName?: string;
  verifiedAt?: string;
  deviationData?: any;
}

@Component({
  selector: 'app-ausschuss-fotograferen',
  templateUrl: './ausschuss-fotograferen.component.html',
  styleUrls: ['./ausschuss-fotograferen.component.css']
})
export class AusschussFotograferenComponent implements OnInit {
  displayedColumns = ['time', 'samples', 'deviation', 'status'];
  dataSources: { [machine: number]: MatTableDataSource<TimeEntry> } = {};
  machines: Machine[] = [];
  selectedMachine: Machine | null = null;
  nextId: number = 1;
  times: string[] = this.generateTimes();

  constructor(
    private appComponent: AppComponent,
    public dialog: MatDialog,
    private userDataService: UserDataService,
    private auftragService: AuftragService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
  
      this.loadExistingData();
  
    this.appComponent.updateSectionStatus('AusschussFotograferenComponent', 'in-progress');
  }

  generateTimes(): string[] {
    const times = [];
    for (let hour = 6; hour <= 21; hour++) {
      times.push(hour.toString().padStart(2, '0') + ':00');
    }
    return times;
  }

  async loadExistingData(): Promise<void> {
    const collectedData = await this.auftragService.getCollectedData();
    if (collectedData && collectedData.ProzessSchritteLinien) {
      collectedData.ProzessSchritteLinien.forEach((line: any) => {
        const machine = line.machine;
        this.machines.push(machine);
        this.dataSources[machine.id] = new MatTableDataSource<TimeEntry>(line.Ausschuss || []);
        if (this.dataSources[machine.id].data.length === 0) {
          this.addRow(machine.id); // Add the first row by default if no data exists
        }
      });
      this.selectedMachine = this.machines[0]; // Select the first machine by default
      this.checkCompletionStatus();
    }
  }

  addRow(machineId: number): void {
    if (this.canAddRow(machineId)) {
      const currentTime = new Date();
      const currentDate = currentTime.toISOString().split('T')[0];
      const closestHour = this.times.find(time => {
        const [hour] = time.split(':').map(Number);
        return hour >= currentTime.getHours();
      }) || this.times[0];
      const newRow: TimeEntry = {
        id: `${this.nextId++}`, // Use nextId as a placeholder ID
        id2: machineId.toString(),
        time: closestHour, // Placeholder for user-selected time
        samples: 0,
        deviation: false,
        verified: false
      };

      if (!this.dataSources[machineId]) {
        this.dataSources[machineId] = new MatTableDataSource<TimeEntry>();
      }

      this.dataSources[machineId].data.push(newRow);
      this.dataSources[machineId].filter = ''; // Refresh the table
    }
  }

  canAddRow(machineId: number): boolean {
    const data = this.dataSources[machineId]?.data || [];
    return data.length === 0 || data[data.length - 1].verified;
  }

  onTimeChange(event: any, row: TimeEntry): void {
    const selectedTime = event.value;
    const currentDate = new Date().toISOString().split('T')[0];
    row.time = selectedTime;
    row.id = `${currentDate}-${selectedTime}-${row.id2}`; // Update the ID with the selected time
  }

  openDeviationDialog(row: TimeEntry, machineId: number): void {
    let orderNumber = this.auftragService.getCachedData('auftragsnummer');
    orderNumber = orderNumber.replace(/"/g, '');
    const dialogRef = this.dialog.open(AbweichungenComponent, {
      width: '80%',
      data: {
        orderNumber: orderNumber,
        rowData: row,
        componentName: 'AusschussFotograferenComponent',
        photoPaths: row.deviationData ? row.deviationData.photos : [],
        text: row.deviationData ? row.deviationData.text : ''
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        row.deviation = true;
        row.deviationData = {
          photos: result.photos,
          text: result.text
        };

        if (result.deletedPhotos) {
          row.deviationData.photos = row.deviationData.photos.filter(
            (path: string) => !result.deletedPhotos.includes(path)
          );
        }

        this.saveData(); // Save the updated data after getting the path from the dialog
      }
    });
  }

  verifyEntry(row: TimeEntry, machineId: number): void {
    this.userDataService.getCurrentUserData().subscribe(user => {
      row.verified = true;
      row.verifierName = `${user.firstname} ${user.lastname}`;
      row.verifiedAt = new Date().toISOString();
      this.cdr.detectChanges(); // Trigger change detection
      this.checkCompletionStatus();
      this.saveData(); // Save the updated data to the server or local storage
    });
  }

  async saveData(): Promise<void> {
    const collectedData = await this.auftragService.getCollectedData();
    this.machines.forEach(machine => {
      const machineData = collectedData.ProzessSchritteLinien.find((line: any) => line.machine.id === machine.id);
      if (machineData) {
        machineData.Ausschuss = this.dataSources[machine.id].data;
      }
    });
    this.auftragService.setCollectedData(collectedData);
    this.checkCompletionStatus();
  }

  async cancel(machineId: number): Promise<void> {
    const collectedData = await this.auftragService.getCollectedData();
    const machineData = collectedData.ProzessSchritteLinien.find((line: any) => line.machine.id === machineId);
    this.dataSources[machineId].data = machineData.Ausschuss;
  }

  checkCompletionStatus(): void {
    let allVerified = true;
    this.machines.forEach(machine => {
      const data = this.dataSources[machine.id]?.data || [];
      if (data.some(row => !row.verified)) {
        allVerified = false;
      }
    });

    if (allVerified) {
      this.appComponent.updateSectionStatus('AusschussFotograferenComponent', 'completed');
    } else {
      this.appComponent.updateSectionStatus('AusschussFotograferenComponent', 'in-progress');
    }
  }
}
