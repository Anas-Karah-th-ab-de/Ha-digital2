import { Component, OnInit } from '@angular/core';
import { UserDataService } from '../../../service/user-data.service';
import { AuftragService } from '../auftrag.service';
import { AppComponent } from '../../../app.component';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-pruefgewicht-ermitteln',
  templateUrl: './pruefgewicht-ermitteln.component.html',
  styleUrls: ['./pruefgewicht-ermitteln.component.css']
})
export class PruefgewichtErmittelnComponent implements OnInit {
  posData: any[] = []; // Store posData directly
  singleWeights: any = {}; // Store weights per position
  selectedComponent: any = null; // For manual selection of the lightest component
  userHasSelected = false; // Track if the user has manually selected a component

  fullPackagesList: any[] = Array.from({ length: 10 }, () => ({ weight: null })); // Store full package weights
  calculationResults: any = {
    avgFullPackages: 0,
    avgSingleItems: 0,
    overallAvg: 0,
    leichtesteKomponente: { name: '', gewicht: 0 },
    halbeLeichtesteKomponente: 0,
    obereGrenze: 0,
    untereGrenze: 0,
    bemerkungen: ''
  };

  isVerified1 = false;
  isVerified2 = false;
  pl1Verifier: any;
  pl2Verifier: any;
  secondVerifierCode1: string = '';

  constructor(
    private cdr: ChangeDetectorRef,
    private appComponent: AppComponent,
    private userDataService: UserDataService,
    private auftragService: AuftragService
  ) {}

  ngOnInit(): void {
    this.appComponent.updateSectionStatus('PruefgewichtErmittelnComponent', 'in-progress');
    this.initializeWeights();
  }

  async initializeWeights(): Promise<void> {
    const collectedData = await this.auftragService.getCollectedData();
    this.posData = collectedData.posData || [];

    if (collectedData.fullPackagespruefgewicht) {
        this.fullPackagesList = collectedData.fullPackagespruefgewicht;
    }

    this.posData.forEach((data) => {
        if (collectedData.posData[data.pos]?.gewicht) {
            this.singleWeights[data.pos] = collectedData.posData[data.pos].gewicht;
        } else {
            this.singleWeights[data.pos] = null;
        }

        this.singleWeights[data.pos] = { singleItems: data.gewicht };

        if (collectedData.calculationResultspruefgewicht) {
            this.pl1Verifier = collectedData.calculationResultspruefgewicht.pl1Verifier || null;
            this.pl2Verifier = collectedData.calculationResultspruefgewicht.pl2Verifier || null;
            this.calculationResults = collectedData.calculationResultspruefgewicht.calculationResults || this.calculationResults;
            this.isVerified1 = !!this.pl1Verifier;
            this.isVerified2 = !!this.pl2Verifier;
            if (this.isVerified1 && this.isVerified2) {
                this.appComponent.updateSectionStatus('PruefgewichtErmittelnComponent', 'completed');
            } else {
                this.appComponent.updateSectionStatus('PruefgewichtErmittelnComponent', 'in-progress');
            }
        }
    });

    if (collectedData.calculationResultspruefgewicht) {
        this.calculationResults = collectedData.calculationResultspruefgewicht;
    }

    this.calculate();

    // Nach der Berechnung setzen wir den Standardwert für das Dropdown-Menü.
    if (!this.userHasSelected && this.calculationResults.leichtesteKomponente) {
        this.selectedComponent = this.posData.find(
            data => data.rohwarepackmittel_bezeichnung === this.calculationResults.leichtesteKomponente.name
        );
    }
}


  onInputChange(): void {
    this.calculate();
    this.saveData();
  }

  onComponentChange(): void {
    this.userHasSelected = true;  // Markieren, dass der Benutzer eine manuelle Auswahl getroffen hat

    if (this.selectedComponent) {
        this.updateLeichtesteKomponente(this.selectedComponent);
        this.calculate();  // Berechnungen nach der Auswahl durchführen
    }
}


  getSingleItems(data: any): number {
    return this.singleWeights[data.pos]?.singleItems ?? null;
  }

  onSingleItemChange(data: any, value: number): void {
    if (!this.singleWeights[data.pos]) {
        this.singleWeights[data.pos] = {};
    }
    this.singleWeights[data.pos].singleItems = value;

    // Berechnungen und Updates durchführen
    this.calculate();
    this.saveData();
    this.cdr.detectChanges();
}


  calculate(): void {
    let totalSingleItems = 0;
    let countSingleItems = 0;

    this.posData.forEach(data => {
      const weights = this.singleWeights[data.pos];
      if (weights?.singleItems !== null) {
        totalSingleItems += weights.singleItems;
        countSingleItems++;
      }
    });

    this.calculationResults.avgSingleItems = countSingleItems ? (totalSingleItems / countSingleItems) : 0;
    this.calculateFullPackages();
    this.calculateGrenzen();
  }

  calculateFullPackages(): void {
    let totalFullPackages = 0;
    let countFullPackages = 0;

    this.fullPackagesList.forEach(fullPackage => {
      if (fullPackage.weight !== null) {
        totalFullPackages += fullPackage.weight;
        countFullPackages++;
      }
    });

    this.calculationResults.avgFullPackages = countFullPackages 
      ? +(totalFullPackages / countFullPackages).toFixed(2) 
      : 0;
    this.calculationResults.overallAvg = 
      +(this.calculationResults.avgFullPackages + this.calculationResults.avgSingleItems) / 2;

  }

  calculateGrenzen(): void {
    if (this.posData.length > 0) {
        let leichtesteKomponente = { name: '', gewicht: Number.MAX_SAFE_INTEGER };

        this.posData.forEach((data) => {
            if (data.rohwarepackmittel_bezeichnung !== 'TamperEvident' && 
                data.rohwarepackmittel_bezeichnung !== 'SHILA' && 
                data.rohwarepackmittel_bezeichnung !== 'SHI' && 
                this.singleWeights[data.pos] && 
                typeof this.singleWeights[data.pos].singleItems === 'number' &&
                this.singleWeights[data.pos].singleItems < leichtesteKomponente.gewicht) {
                leichtesteKomponente = { name: data.rohwarepackmittel_bezeichnung, gewicht: this.singleWeights[data.pos].singleItems };
            }
        });

        if (leichtesteKomponente.gewicht !== Number.MAX_SAFE_INTEGER) {
            if (!this.userHasSelected) {  // Nur aktualisieren, wenn der Benutzer keine manuelle Auswahl getroffen hat
                this.updateLeichtesteKomponente(leichtesteKomponente);
            }
        }

        const avgFullPackagesWeight = this.calculationResults.avgFullPackages;
        this.calculationResults.obereGrenze = +(avgFullPackagesWeight + this.calculationResults.halbeLeichtesteKomponente).toFixed(2);
        this.calculationResults.untereGrenze = +(avgFullPackagesWeight - this.calculationResults.halbeLeichtesteKomponente).toFixed(2);
        if (!this.userHasSelected) {
          this.selectedComponent = this.posData.find(
              data => data.rohwarepackmittel_bezeichnung === this.calculationResults.leichtesteKomponente.name
          );
      }
      }
}


  updateLeichtesteKomponente(component: any): void {
    this.calculationResults.leichtesteKomponente = component;
    this.calculationResults.halbeLeichtesteKomponente = +(component.gewicht / 2).toFixed(2);
    this.selectedComponent = component; // Set the selected component to the lightest component
  }

  verifyFirst(): void {
    this.userDataService.getCurrentUserData().subscribe(user => {
      this.pl1Verifier = {
        name: `${user.firstname} ${user.lastname}`,
        timestamp: new Date().toISOString()
      };
      this.isVerified1 = true;
      this.saveData();
    });
  }

  verifySecond(): void {
    if (this.secondVerifierCode1) {
      const processedCode = parseInt(this.secondVerifierCode1.startsWith('99') ? this.secondVerifierCode1.substring(2) : this.secondVerifierCode1);
      this.userDataService.getUserByQRCode(processedCode).subscribe(user => {
        if (this.pl1Verifier && this.pl1Verifier.name === user.name) {
          alert('Der zweite Prüfer kann nicht derselbe wie der erste Prüfer sein.');
          return;
        }
        this.pl2Verifier = {
          name: user.name,
          timestamp: new Date().toISOString()
        };
        this.isVerified2 = true;
        this.appComponent.updateSectionStatus('PruefgewichtErmittelnComponent', 'completed');
        this.saveData();
      });
    }
  }

  async saveData(): Promise<void> {
    console.log('Saving data...');
    const collectedData = await this.auftragService.getCollectedData();

    this.posData.forEach(data => {
      if (!collectedData.posData[data.pos]) {
        collectedData.posData[data.pos] = {};
      }
      collectedData.posData[data.pos].gewicht = this.singleWeights[data.pos]?.singleItems || null;
    });

    if (!collectedData.fullPackagespruefgewicht) {
      collectedData.fullPackagespruefgewicht = [];
    }
    collectedData.fullPackagespruefgewicht = this.fullPackagesList.map(pkg => ({
      ...pkg
    }));
    if (!collectedData.calculationResultspruefgewicht) {
      collectedData.calculationResultspruefgewicht = {};
    }

    collectedData.calculationResultspruefgewicht = {
      ...this.calculationResults,
      pl1Verifier: this.pl1Verifier,
      pl2Verifier: this.pl2Verifier
    };

    this.auftragService.setCollectedData(collectedData);
  }

  cancel(): void {
    this.initializeWeights();
  }
}
