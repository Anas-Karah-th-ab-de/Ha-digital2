import { Component, OnInit,ChangeDetectorRef } from '@angular/core';
import { AuftragService } from '../auftrag.service';
import { UserDataService } from '../../../service/user-data.service';
import { AppComponent } from '../../../app.component';  // Import the AppComponent

@Component({
  selector: 'app-pruefung-ware-packmittel',
  templateUrl: './pruefung-ware-packmittel.component.html',
  styleUrls: ['./pruefung-ware-packmittel.component.css']
})
export class PruefungWarePackmittelComponent implements OnInit {
  orders: any[] = [];
  originalOrders: any[] = [];
  displayedColumns: string[] = [
    'rohwarepackmittel_artnr',
    'rohwareartnralternativ',
    'rohwarepackmittel_bezeichnung',
    'rohwareCharge',
    'pmCharge',
    'rohwaredruckdatum',
    'status'
  ];

  constructor(
    private cdr: ChangeDetectorRef,
    private userDataService: UserDataService,
    private orderService: AuftragService,
    private appComponent: AppComponent  // Inject the AppComponent
  ) {}

  async ngOnInit(): Promise<void> {
    this.orders = this.orderService.getOrders();
    console.log(this.orders);
  
    const collectedData = await this.orderService.getCollectedData();
  
    this.originalOrders = JSON.parse(JSON.stringify(this.orders)); // Deep copy to store the original state
    
    if (collectedData && collectedData.posData) {
      this.orders = collectedData.posData.map((posData: any) => ({
        ...posData,
        PruefungWarePackmittel: posData.PruefungWarePackmittel || []
      }));
    }
    console.log(this.orders);
    // Anpassung der Orders basierend auf dem Status in originalOrders
    this.originalOrders.forEach(order => {
      const originalOrder = this.orders.find((o: any) => o.pos === order.pos);
      if (originalOrder && originalOrder.status === 'geprüft') {
        order.status = 'geprüft';
      }
    });
    console.log( this.originalOrders);
    this.updateComponentStatus();
    this.cdr.detectChanges();
  }
  status(order: any): void {
    // Überprüfen, ob einer der Order-Status "geprüft" ist
    const orderStatus = order.status;
  
    if (orderStatus === 'geprüft') {
      this.orders.forEach((o: any) => {
        // Wenn eine Bestellung "geprüft" ist, setzen wir die anderen auf den gleichen Status
        if (o !== order) {
          o.status = 'geprüft';
        }
      });
    } else {
      // Falls die Bestellung nicht "geprüft" ist, setze den Status auf einen Standardwert oder auf den Originalstatus
      order.status = this.originalOrders.find((o: any) => o.id === order.id)?.status || 'offen';
    }
  
    // Nach der Änderung, eventuell die Ansicht aktualisieren
    this.cdr.detectChanges();
  }
  pruefen(order: any): void {
    if (order) {
      this.userDataService.getCurrentUserData().subscribe(user => {
        const reviewerName = user.firstname + " " + user.lastname;
        const timestamp = new Date().toISOString();

        order.status = 'geprüft';
        order.checkedBy = reviewerName;
        order.checkedAt = timestamp;

        if (!order.PruefungWarePackmittel) {
          order.PruefungWarePackmittel = [];
        }

        order.PruefungWarePackmittel.push({
          checker: reviewerName,
          checkedAt: timestamp
        });

        this.saveOrderChanges(order);
        this.updateComponentStatus();
      });
    }
    this.status(order);
  }

  async saveOrderChanges(order: any): Promise<void> {
    try {
      // Retrieve the collected data asynchronously
      const collectedData = await this.orderService.getCollectedData();
      const posIndex = collectedData.posData.findIndex((posData: any) => posData.pos === order.pos);
  
      if (posIndex !== -1) {
        // Update specific order data if the position is found
        collectedData.posData[posIndex].PruefungWarePackmittel = order.PruefungWarePackmittel;
        collectedData.posData[posIndex].status = order.status;
        collectedData.posData[posIndex].checkedBy = order.checkedBy;
        collectedData.posData[posIndex].checkedAt = order.checkedAt;
        await this.orderService.setCollectedData(collectedData); // Persist changes
      } else {
        console.warn('Position not found:', order.pos);
        // Optionally handle the case where the position is not found
      }
    } catch (error) {
      console.error('Failed to save order changes:', error);
      // Handle or log the error appropriately
    }
  }
  

  updateComponentStatus(): void {
    const allChecked = this.orders.every(order => order.status === 'geprüft');
    if (allChecked) {
      this.appComponent.updateSectionStatus('PruefungWarePackmittelComponent', 'completed');
    } else {
      this.appComponent.updateSectionStatus('PruefungWarePackmittelComponent', 'in-progress');
    }
  }

  async save(): Promise<void> {
    try {
      // Wait for the collected data to be fetched
      const collectedData = await this.orderService.getCollectedData();
      collectedData.posData = this.orders.map(order => ({
        ...order,
        PruefungWarePackmittel: order.PruefungWarePackmittel || []
      }));
  
      // Save the updated collected data
       this.orderService.setCollectedData(collectedData);
      console.log('Data saved successfully');
    } catch (error) {
      console.error('Error saving data:', error);
    }
  }
  
  cancel(): void {
    // Revert to the original state
    this.orders = JSON.parse(JSON.stringify(this.originalOrders));
    this.orderService.setOrders(this.orders);
    this.updateComponentStatus(); // Update the status after cancelling changes
  }
}
