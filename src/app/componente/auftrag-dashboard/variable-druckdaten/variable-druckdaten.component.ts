import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuftragService } from '../auftrag.service';
import { AppComponent } from '../../../app.component'; // Import the AppComponent

@Component({
  selector: 'app-variable-druckdaten',
  templateUrl: './variable-druckdaten.component.html',
  styleUrls: ['./variable-druckdaten.component.css']
})
export class VariableDruckdatenComponent implements OnInit {
  selectedPositions: any[] = [];
  collectedData: any = {};

  constructor(
    private router: Router,
    private auftragService: AuftragService,
    private appComponent: AppComponent // Inject the AppComponent
  ) {}

  async ngOnInit(): Promise<void> {
    this.collectedData = await this.auftragService.getCollectedData();
    if (this.collectedData) {
      this.selectedPositions = this.collectedData.selectedPositions || [];
      this.checkAllPositionsStatus();
    }
  }

  navigateToPosition(pos: any): void {
    this.router.navigate(['/VariableDruckdatenComponent', pos]);
  }

  checkAllPositionsStatus(): void {
    if (this.selectedPositions && this.selectedPositions.length > 0) {
      const allPositionsCompleted = this.selectedPositions.every(pos => {
        const positionData = this.collectedData.posData ? this.collectedData.posData[pos] || {} : {};
        return positionData.isConfirmed === true;
      });

      if (allPositionsCompleted) {
        this.appComponent.updateSectionStatus('VariableDruckdatenComponent', 'completed');
      } else {
        this.appComponent.updateSectionStatus('VariableDruckdatenComponent', 'in-progress');
      }
    } else {
      this.appComponent.updateSectionStatus('VariableDruckdatenComponent', 'in-progress');
    }
  }
}
