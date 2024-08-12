import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { UserDataService } from '../../../service/user-data.service';
import { AuftragService } from '../auftrag.service';
import { ChangeDetectorRef } from '@angular/core';
import { AppComponent } from '../../../app.component';
import { map,Observable } from 'rxjs';

interface Machine {
  id: number;
  name: string;
}
interface WeightEntry {
  id: number;
  weight: number;
  deviation: number;
  verified: boolean;
  verifierName?: string;
  verifiedAt?: string;
}

@Component({
  selector: 'app-kontrollwaage-kalibrieren',
  templateUrl: './kontrollwaage-kalibrieren.component.html',
  styleUrls: ['./kontrollwaage-kalibrieren.component.css']
})
export class KontrollwaageKalibrierenComponent implements OnInit {
  displayedColumns = ['id', 'weight', 'deviation', 'verify'];
  dataSource: MatTableDataSource<WeightEntry>;
  nextId: number = 1; // Track the next ID to be assigned
  referenceWeight: number = 0;
  scales: Machine[]  = [
    { id: 1, name: 'Waage 1' },
    { id: 2, name: 'Waage 2' },
    { id: 3, name: 'Waage 3' }]
  selectedScale: string | null = null;

  constructor(
    private appComponent: AppComponent,
    private userDataService: UserDataService, 
    private auftragService: AuftragService, 
    private cdr: ChangeDetectorRef
  ) {
    this.dataSource = new MatTableDataSource<WeightEntry>([]); 
  }

  async ngOnInit(): Promise<void> {
    this.appComponent.updateSectionStatus('KontrollwaageKalibrierenComponent', 'in-progress');
    this.auftragService.getWaage().subscribe(data => {this.scales = data})

    this.referenceWeight = await this.calculateReferenceWeight();
    this.selectedScale = this.scales[0].name; // Set a default scale or get it from somewhere
    this.loadExistingData();
    if (this.dataSource.data.length === 0) {
      this.addRow(); // Add the first row by default if no data exists
    }
  }

  async calculateReferenceWeight(): Promise<number> {
    const collectedData = await this.auftragService.getCollectedData();
    const ullPackagespruefgewicht = collectedData.fullPackagespruefgewicht;
    let totalWeight = 0;
    let count = 0;
    
    ullPackagespruefgewicht.forEach((pos: any) => {
      console.log(pos)
      if (pos.weight) {
        totalWeight += pos.weight;
        count++;
      }
    });

    return count > 0 ? totalWeight / count : 0;
  }

 // createNewEntry(id: number, defaultWeight: number = 0): WeightEntry {
 //   return { id, weight: defaultWeight, deviation: 0, verified: false };
 // }
  

  async loadExistingData(): Promise<void> {
    const collectedData = await this.auftragService.getCollectedData();
    
    if (collectedData && collectedData.kontrollwaage) {
      console.log(collectedData.kontrollwaage);
  
      // Check if the waage matches the selected scale
      if (this.selectedScale && collectedData.kontrollwaage.waage === this.selectedScale) {
        // Update the dataSource with the existing weight entries
        this.dataSource.data = collectedData.kontrollwaage.weightEntries;
        
        // Calculate the nextId based on the existing entries
        this.nextId = this.dataSource.data.length > 0 ? Math.max(...this.dataSource.data.map(entry => entry.id)) + 1 : 1;
  
        // Update the section status
        this.appComponent.updateSectionStatus('KontrollwaageKalibrierenComponent', 'completed');
      }
    }
  }
  
  addRow(): void {
    if (this.dataSource.data.length > 0) {
      // Use the weight of the last entry for subsequent rows
      const lastWeight = parseFloat(this.dataSource.data[this.dataSource.data.length - 1].weight.toFixed(2));
      this.addEntry(lastWeight);
    } else {
      // For the first row, find the closest weight to referenceWeight
      this.getClosestWeightToReference().subscribe(closestWeight => {
        const formattedWeight = parseFloat(closestWeight.toFixed(2));
        this.addEntry(formattedWeight);
      });
    }
  }
  onWeightChange(row: any): void {
    row.weight = parseFloat(row.weight).toFixed(2);
  }
  
  
  private addEntry(defaultWeight: number): void {
    if (this.canAddRow()) {
      this.dataSource.data.push(this.createNewEntry(this.nextId++, defaultWeight));
      this.dataSource.filter = ''; // Refresh the table
      this.cdr.detectChanges(); // Trigger change detection manually
      this.appComponent.updateSectionStatus('KontrollwaageKalibrierenComponent', 'in-progress');
    }
  }
  
  
  createNewEntry(id: number, defaultWeight: number): WeightEntry {
    return {
      id,
      weight: defaultWeight,
      deviation: 0,
      verified: false,
      verifierName: undefined,
      verifiedAt: undefined
    };
  }
  
  getClosestWeightToReference(): Observable<number> {
    return this.auftragService.getreferenceWeight().pipe(
      map(data => {
        console.log(data); // Log the fetched data for debugging purposes
  
        // Map weights to have two decimal places and convert them back to numbers
        const weightList = data.map(doc => parseFloat(doc.weight.toFixed(2)));
  
        // Ensure that there is data to reduce; if not, return 0 or handle as needed
        if (weightList.length === 0) {
          return 0; // or throw an error if an empty array is unexpected
        }
  
        // Find the closest weight to the reference weight
        return weightList.reduce((prev, curr) => {
          return (Math.abs(curr - this.referenceWeight) < Math.abs(prev - this.referenceWeight) ? curr : prev);
        });
      })
    );
  }
  
  
  
  canAddRow(): boolean {
    return this.dataSource.data.length === 0 || this.dataSource.data[this.dataSource.data.length - 1].verified;
  }

  verifyEntry(entry: WeightEntry): void {
    this.userDataService.getCurrentUserData().subscribe(user => {
      entry.verified = true;
      entry.verifierName = `${user.firstname} ${user.lastname}`;
      entry.verifiedAt = new Date().toISOString();
      this.cdr.detectChanges(); // Trigger change detection
      this.saveData(); // Save after verification
      this.updateComponentStatus(); // Update the component status
    });
  }

  async saveData(): Promise<void> {
    // Ensure all weights are numbers and formatted to two decimal places.
    this.dataSource.data = this.dataSource.data.map(entry => ({
      ...entry,
      weight: parseFloat(entry.weight.toFixed(2)) // Format weight with two decimal places
    }));
  
    // Fetch the existing data from the service
    const collectedData = await this.auftragService.getCollectedData();
  
    // Update the specific section with the new data
    collectedData.kontrollwaage = {
      waage: this.selectedScale, // The selected scale name
      weightEntries: this.dataSource.data.map(entry => ({
        id: entry.id,
        weight: entry.weight,
        deviation: entry.deviation,
        verified: entry.verified,
        verifierName: entry.verifierName || null, // Include verifierName if available
        verifiedAt: entry.verifiedAt || null      // Include verifiedAt if available
      }))
    };
  
    // Save the updated data back to the service
    await this.auftragService.setCollectedData(collectedData);
    this.appComponent.updateSectionStatus('KontrollwaageKalibrierenComponent', 'completed');
  }
  
  
  

  updateComponentStatus(): void {
    const allVerified = this.dataSource.data.every(entry => entry.verified);
    if (allVerified) {
      this.appComponent.updateSectionStatus('KontrollwaageKalibrierenComponent', 'completed');
    } else {
      this.appComponent.updateSectionStatus('KontrollwaageKalibrierenComponent', 'in-progress');
    }
  }

  cancel(): void {
    this.loadExistingData();
    this.cdr.detectChanges();
  }
}
