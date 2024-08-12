import { Component, OnInit } from '@angular/core';
import { AuftragService } from './auftrag.service';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { AbweichungenComponent } from '../abweichungen/abweichungen.component';
import { UserDataService } from '../../service/user-data.service';
import { ChangeDetectorRef } from '@angular/core';

interface TimeEntry {
  id: string;
  id2: string;
  machine: string;
  time: string;
  samples: number;
  deviation: boolean;
  verified: boolean;
  verifierName?: string;
  verifiedAt?: string;
  deviationData?: any;
}

@Component({
  selector: 'app-auftrag-dashboard',
  templateUrl: './auftrag-dashboard.component.html',
  styleUrls: ['./auftrag-dashboard.component.css']
})
export class AuftragDashboardComponent implements OnInit {
  auftragsnummer: string = '';
  auftragData: any = null;
  order: any = null;
  displayedColumns: string[] = ['machine', 'time', 'samples', 'deviation', 'status'];
  dataSource: MatTableDataSource<TimeEntry> = new MatTableDataSource<TimeEntry>();
  times: string[] = this.generateTimes();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private auftragService: AuftragService,
    public dialog: MatDialog,
    private userDataService: UserDataService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const orderNumber = params['orderNumber'];
      this.auftragsnummer = orderNumber;
      if (this.auftragsnummer) {
        this.fetchAuftragData();
      }
    });
  }

  generateTimes(): string[] {
    const times = [];
    for (let hour = 6; hour <= 21; hour++) {
      times.push(hour.toString().padStart(2, '0') + ':00');
    }
    return times;
  }

  fetchAuftragData() {
    if (this.auftragsnummer) {
      this.auftragService.getAuftragData(this.auftragsnummer).subscribe(
        (data: any) => {
          this.auftragData = data;
          this.order = data.orders[0]; // Use the first order as the basis
          this.extractChargeAndMhd();
          this.auftragService.setOrders(this.auftragData.orders);
          console.log('collected',  this.auftragData)
        //  this.auftragService.setCollectedData(this.auftragData.collectedData[0]);
          this.initializeTimeEntries();
          this.cacheData('auftragsnummer', this.auftragsnummer);
        },
        (error) => {
          this.cacheData('auftragsnummer', this.auftragsnummer);
          console.error('Error fetching data', error);
        }
      );
    }
  }

  extractChargeAndMhd() {
    if (this.auftragData && this.auftragData.orders) {
      this.auftragData.orders.forEach((order: any) => {
        if (order.wacharge) {
          const parts = order.wacharge.split('|');
          order.charge = parts[0] || '';
          order.mhd = parts[1] || '';
          order.druckdatum = parts[2] || '';
        }
        if (order.rohwarepackmittel_charge) {
          const parts = order.rohwarepackmittel_charge.split('|');
          order.rohwareCharge = parts[0] || '';
          order.rohwareMhd = parts[1] || '';
          order.rohwaredruckdatum = parts[2] || '';
          order.pmCharge = parts[3] || '';
        }
      });
    }
  }

  async initializeTimeEntries(): Promise<void> {
    const collectedData = await this.auftragService.getCollectedData();

    if (!collectedData || !collectedData.ProzessSchritteLinien) {
      console.error('ProzessSchritteLinien is not defined');
      return;
    }
  
    const currentDate = new Date().toISOString().split('T')[0];
    const currentTime = new Date();
    const closestHour = this.times.find(time => {
      const [hour] = time.split(':').map(Number);
      return hour >= currentTime.getHours();
    }) || this.times[0];
  
    const timeEntries = collectedData.ProzessSchritteLinien.map((line: any) => {
      return {
        id: `${currentDate}-${closestHour}`,
        id2: line.machine,
        machine: line.machine,
        time: closestHour,
        samples: 0,
        deviation: false,
        verified: false
      };
    });
  
    this.dataSource.data = timeEntries;
  }
  

  onTimeChange(event: any, row: TimeEntry): void {
    const selectedTime = event.value;
    const currentDate = new Date().toISOString().split('T')[0];
    row.time = selectedTime;
    row.id = `${currentDate}-${selectedTime}`;
    this.checkTimeWarning(selectedTime);
  }

  checkTimeWarning(selectedTime: string): void {
    const currentTime = new Date();
    const [selectedHour, selectedMinutes] = selectedTime.split(':').map(Number);
    const selectedDate = new Date();
    selectedDate.setHours(selectedHour, selectedMinutes, 0, 0);

    if (selectedDate.getTime() - currentTime.getTime() <= 15 * 60 * 1000) {
      alert('Warning: The selected time is within 15 minutes of the current time and has not started yet.');
    }
  }

  cacheData(key: string, data: any) {
    localStorage.setItem(key, JSON.stringify(data));
  }

  getCachedData(key: string) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  }

  getCachedAuftragData() {
    const cachedData = this.getCachedData('auftragsnummer');
    this.auftragsnummer = cachedData;
    if (cachedData) {
      this.auftragData = cachedData;
      if (this.auftragData.orders && this.auftragData.orders.length > 0) {
        this.order = this.auftragData.orders[0]; // Use the first order as the basis
        this.extractChargeAndMhd();
      }
    } else {
      console.warn('No cached data found for', this.auftragsnummer);
    }
  }

  navigateToSection(section: string) {
    this.router.navigate([`/${section}`]);
  }

  openDeviationDialog(row: TimeEntry): void {
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

  verifyEntry(row: TimeEntry): void {
    this.userDataService.getCurrentUserData().subscribe(user => {
      row.verified = true;
      row.verifierName = `${user.firstname} ${user.lastname}`;
      row.verifiedAt = new Date().toISOString();
      this.cdr.detectChanges(); // Trigger change detection
      this.saveData(); // Save the updated data to the server or local storage
    });
  }

  async saveData(): Promise<void> {
    try {
      // Await the promise to get collected data asynchronously
      const collectedData = await this.auftragService.getCollectedData();
  
      // Continue with your logic only after the data has been successfully fetched
      const dataToSave = this.dataSource.data.map(entry => ({
        id: entry.id,
        id2: entry.id2,
        time: entry.time,
        samples: entry.samples,
        deviation: entry.deviation,
        verified: entry.verified,
        verifierName: entry.verifierName,
        verifiedAt: entry.verifiedAt,
        deviationData: entry.deviationData
      }));
  
      // Update each machine's data within the collected data structure
      this.dataSource.data.forEach(entry => {
        const machineData = collectedData.ProzessSchritteLinien.find((line:any) => line.machine === entry.id2);
        if (machineData) {
          machineData.Ausschuss = [entry]; // Update or add Ausschuss for the specific machine
        }
      });
  
      // Save the updated collected data back to the server or storage
      this.auftragService.setCollectedData(collectedData);
    } catch (error) {
      console.error('Error while saving data:', error);
      // Handle the error appropriately
    }
  }
}  
