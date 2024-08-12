import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { UserDataService } from '../../../service/user-data.service';
import { AuftragService } from '../auftrag.service';
import { AppComponent } from '../../../app.component';

interface Machine {
  id: number;
  name: string;
}

@Component({
  selector: 'app-prozess-schritte-linien',
  templateUrl: './prozess-schritte-linien.component.html',
  styleUrls: ['./prozess-schritte-linien.component.css']
})
export class ProzessSchritteLinienComponent implements OnInit {
  selectedMachine!: Machine;
  machines: Machine[] = [];
  processSteps: any[] = [];
  firstVerifier: any = null;
  secondVerifier: any = null;
  secondVerifierCode: string = '';
  orders: any[] = [];
  collectedData: any;

  initialProcessSteps = [
    { label: '1 - Auspacken', checked: false },
    { label: '2 - GI - FS austauschen', checked: false },
    { label: '3 - Wiegen', checked: false },
    { label: '4 - 100%-Kontrolle', checked: false },
    { label: '5 - Konfektionieren FW', checked: false },
    { label: '6 - Konfektionieren Display', checked: false },
    { label: '7 - Blisteretikettierung', checked: false },
    { label: '8 - Blisterpressung', checked: false },
    { label: '9 - ', checked: false },
    { label: '10 - ', checked: false },
    { label: '11 - ', checked: false },
    { label: '12 - Inkjet', checked: false, hasDropdown: true, dropdownOptions: ['Option 1', 'Option 2'] },
    { label: '13 - Etikettieren', checked: false, hasDropdown: true, dropdownOptions: ['Option 1', 'Option 2'] },
    { label: '14 - ', checked: false },
    { label: '15 - Aggregation', checked: false },
    { label: '16 - Sonstige', checked: false, hasInput: true }
  ];

  constructor(
    private appComponent: AppComponent,
    private dialog: MatDialog,
    private userDataService: UserDataService,
    private auftragService: AuftragService
  ) {}

  async ngOnInit(): Promise<void> {
    try {
      this.machines = await this.loadMachines();
      this.initialProcessSteps = await this.loadInitialProcessSteps();
      this.appComponent.updateSectionStatus('ProzessSchritteLinienComponent', 'in-progress');
      this.orders = this.auftragService.getOrders();
      this.collectedData = await this.auftragService.getCollectedData();
      console.log(this.collectedData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }

  async loadMachines(): Promise<Machine[]> {
    return new Promise((resolve, reject) => {
      this.auftragService.getPlaetze().subscribe(
        data => resolve(data),
        error => reject(error)
      );
    });
  }

  async loadInitialProcessSteps(): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this.auftragService.getSchritte().subscribe(
        data => resolve(data),
        error => reject(error)
      );
    });
  }

  onMachineChange(): void {
    const machineData = this.collectedData?.ProzessSchritteLinien?.find((entry: any) => entry.machine.id === this.selectedMachine.id);

    if (machineData) {
      this.processSteps = machineData.processSteps.map((step: any) => ({ ...step }));
      this.firstVerifier = machineData.firstVerifier || null;
      this.secondVerifier = machineData.secondVerifier || null;
      this.secondVerifierCode = '';
      if (this.secondVerifier) {
        this.disableInputs();
      }
    } else {
      this.resetProcessSteps();
    }
    this.updateSectionStatus();
  }

  resetProcessSteps(): void {
    this.processSteps = this.initialProcessSteps.map(step => ({ ...step, disabled: false }));
    console.log(this.processSteps);
    this.firstVerifier = null;
    this.secondVerifier = null;
    this.secondVerifierCode = '';
  }

  onStepChange(step: any, index: number): void {
    if (step.label.includes('Sonstige') && step.checked) {
      step.inputValue = '';
    }
  }

  verifyFirst(): void {
    this.userDataService.getCurrentUserData().subscribe(user => {
      this.firstVerifier = {
        name: `${user.firstname} ${user.lastname}`,
        timestamp: new Date().toISOString()
      };
      this.save();
    });
  }

  verifySecond(): void {
    if (this.secondVerifierCode) {
      const processedCode = parseInt(this.secondVerifierCode.startsWith('99') ? this.secondVerifierCode.substring(2) : this.secondVerifierCode, 10);
      this.userDataService.getUserByQRCode(processedCode).subscribe(user => {
        if (this.firstVerifier && this.firstVerifier.name === user.name) {
          alert('The second verifier cannot be the same as the first verifier.');
          return;
        }
        this.secondVerifier = {
          name: user.name,
          timestamp: new Date().toISOString()
        };
        this.secondVerifierCode = ''; // Clear the input field after verification
        this.disableInputs(); // Disable all inputs after second verification
        this.save();
        this.updateSectionStatus();
      });
    }
  }

  disableInputs(): void {
    this.processSteps.forEach(step => {
      step.disabled = true;
    });
  }

  save(): void {
    if (this.selectedMachine) {
      this.processSteps.forEach(step => {
        if (step.checked && step.label.includes('Sonstige')) {
          step.label = `16 - ${step.inputValue}`;
        }
      });

      const dataToSave = {
        machine: this.selectedMachine,
        processSteps: this.processSteps,
        firstVerifier: this.firstVerifier,
        secondVerifier: this.secondVerifier
      };

      const machineIndex = this.collectedData.ProzessSchritteLinien?.findIndex((entry: any) => entry.machine.id === this.selectedMachine.id);

      if (machineIndex > -1) {
        this.collectedData.ProzessSchritteLinien[machineIndex] = { ...this.collectedData.ProzessSchritteLinien[machineIndex], ...dataToSave };
      } else {
        if (!this.collectedData.ProzessSchritteLinien) {
          this.collectedData.ProzessSchritteLinien = [];
        }
        this.collectedData.ProzessSchritteLinien.push(dataToSave);
      }
      console.log(this.collectedData);
      this.auftragService.setCollectedData(this.collectedData);
    }
  }

  cancel(): void {
    this.onMachineChange();
    this.orders = JSON.parse(JSON.stringify(this.auftragService.getOrders()));
    this.auftragService.setOrders(this.orders);
  }

  updateSectionStatus(): void {
    let allMachinesCompleted = true;

    for (let machine of this.machines) {
      const machineData = this.collectedData.ProzessSchritteLinien?.find((entry: any) => entry.machine.id === machine.id);
      if (!machineData || !machineData.firstVerifier || !machineData.secondVerifier) {
        allMachinesCompleted = false;
        break;
      }
    }

    if (allMachinesCompleted) {
      this.appComponent.updateSectionStatus('ProzessSchritteLinienComponent', 'completed');
    } else {
      this.appComponent.updateSectionStatus('ProzessSchritteLinienComponent', 'in-progress');
    }
  }
}
