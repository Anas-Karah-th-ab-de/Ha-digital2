import { Component, OnInit } from '@angular/core';
import { AuftragService } from '../auftrag.service';
import { UserDataService } from '../../../service/user-data.service';
import { AppComponent } from '../../../app.component';  // Import the AppComponent
@Component({
  selector: 'app-vernichtungsprotokoll',
  templateUrl: './vernichtungsprotokoll.component.html',
  styleUrls: ['./vernichtungsprotokoll.component.css']
})
export class VernichtungsprotokollComponent implements OnInit {
  auftragsnummer: string = '';
  auftragData: any = null;
  destructionProtocolEntries: any[] = [];
  displayedColumns: string[] = [
    'artnr',
    'bezeichnung',
    'charge',
    'dz',
    'mhd',
    'menge',
    'status'
  ];

  constructor(
    private userDataService: UserDataService,
    private auftragService: AuftragService,
    private appComponent: AppComponent
  ) {}

  async ngOnInit(): Promise<void> {
    this.auftragData = await this.auftragService.getCollectedData();
    this.auftragsnummer=this.auftragData.orderNumber;
    //console.log(this.auftragData);
    if (this.auftragData ) {
      this.destructionProtocolEntries = this.auftragData.destructionProtocolEntries || [];
      //console.log(this.destructionProtocolEntries.length);
      this.updateComponentStatus();
    }
  }

  markAsDestroyed(entry: any): void {
    if (!entry.menge) {
      alert('Menge is required to mark as destroyed.');
      return;
    }

    this.userDataService.getCurrentUserData().subscribe(user => {
      const destroyerName = user.firstname + " " + user.lastname;
      const timestamp = new Date().toISOString();

      entry.status = 'vernichtet';
      entry.vernichterName = destroyerName;
      entry.vernichtetAt = timestamp;

      if (!entry.Vernichtungsprotokoll) {
        entry.Vernichtungsprotokoll = [];
      }

      entry.Vernichtungsprotokoll.push({
        destroyer: destroyerName,
        destroyedAt: timestamp
      });

      this.auftragService.setCollectedData(this.auftragData);
      this.updateComponentStatus();
    });
  }
  updateComponentStatus(): void {
    const allDestroyed = this.destructionProtocolEntries.every(entry => entry.status === 'vernichtet');
    if (allDestroyed) {
      this.appComponent.updateSectionStatus('VernichtungsprotokollComponent', 'completed');
    } else {
      this.appComponent.updateSectionStatus('VernichtungsprotokollComponent', 'in-progress');
    }
  }

  save(): void {
    //console.log(this.auftragData);
    this.auftragService.saveCollectedDataToBackend2(this.auftragData).subscribe(
      response => {
        //console.log('Data saved successfully');
      },
      error => {
        console.error('Error saving data', error);
      }
    );
  }

  cancel(): void {
    this.ngOnInit(); // reload the data to reset any changes
  }
}
