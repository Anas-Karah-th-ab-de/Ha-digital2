import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DashboardComponent } from './componente/dashboard/dashboard.component';
import { LoginComponent } from './componente/login/login.component';
import { HaComponent } from './componente/ha/ha.component';
import { AuftragDashboardComponent } from './componente/auftrag-dashboard/auftrag-dashboard.component';
import { PruefungWarePackmittelComponent } from './componente/auftrag-dashboard/pruefung-ware-packmittel/pruefung-ware-packmittel.component';
import { ProzessSchritteLinienComponent } from './componente/auftrag-dashboard/prozess-schritte-linien/prozess-schritte-linien.component';
import { PruefgewichtErmittelnComponent } from './componente/auftrag-dashboard/pruefgewicht-ermitteln/pruefgewicht-ermitteln.component';
import { VariableDruckdatenComponent } from './componente/auftrag-dashboard/variable-druckdaten/variable-druckdaten.component';
import { AusschussFotograferenComponent } from './componente/auftrag-dashboard/ausschuss-fotograferen/ausschuss-fotograferen.component';
import { PruefungBilanzierungComponent } from './componente/auftrag-dashboard/pruefung-bilanzierung/pruefung-bilanzierung.component';
import { KontrollwaageKalibrierenComponent } from './componente/auftrag-dashboard/kontrollwaage-kalibrieren/kontrollwaage-kalibrieren.component';
import { NachweisKuehiketteComponent } from './componente/auftrag-dashboard/nachweis-kuehikette/nachweis-kuehikette.component';
import { WareneingangspruefungComponent } from './componente/auftrag-dashboard/wareneingangspruefung/wareneingangspruefung.component';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { MatIconModule } from '@angular/material/icon';
import { MatGridListModule } from '@angular/material/grid-list';
import { AnimatedLoginComponent } from './componente/login-window/animated-login/animated-login.component';
import { CheckButtonComponent } from './elemente/check-button/check-button.component';
import { QrScannerComponent } from './elemente/qr-scanner/qr-scanner.component';
import { AbweichungenComponent } from './componente/abweichungen/abweichungen.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { VernichtungsprotokollComponent } from './componente/auftrag-dashboard/vernichtungsprotokoll/vernichtungsprotokoll.component';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { HttpUrlInterceptor } from '../interceptors/http-url.interceptor';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

import { MatDialogModule } from '@angular/material/dialog';
import { VariableDruckdatenDetailComponent } from './componente/auftrag-dashboard/variable-druckdaten/variable-druckdaten-detail/variable-druckdaten-detail.component';
import { TestSslComponent } from './test-ssl/test-ssl.component';
@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    LoginComponent,
    HaComponent,
    AuftragDashboardComponent,
    PruefungWarePackmittelComponent,
    ProzessSchritteLinienComponent,
    PruefgewichtErmittelnComponent,
    VariableDruckdatenComponent,
    AusschussFotograferenComponent,
    PruefungBilanzierungComponent,
    VernichtungsprotokollComponent,
    KontrollwaageKalibrierenComponent,
    NachweisKuehiketteComponent,
    WareneingangspruefungComponent,
    AnimatedLoginComponent,
    CheckButtonComponent,
    QrScannerComponent,
    AbweichungenComponent,
    VariableDruckdatenDetailComponent,
    TestSslComponent,
  ],
  imports: [
    HttpClientModule,
    FormsModule,
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatTableModule,
    MatToolbarModule,
    MatGridListModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    MatCheckboxModule,
    MatDialogModule,
    MatSlideToggleModule
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpUrlInterceptor,
      multi: true
    },
    provideAnimationsAsync()
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
