import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './service/auth.guard'; 
import { LicenseGuard } from './service/lizenzen.guard';
import { RightsGuard} from './/service/rights.guard';
import { ProfileGuard } from './/service/profile.guard';

import { DashboardComponent} from './componente/dashboard/dashboard.component';
import { AuftragDashboardComponent } from './componente/auftrag-dashboard/auftrag-dashboard.component';
import { AnimatedLoginComponent } from './componente/login-window/animated-login/animated-login.component';
import {PruefungWarePackmittelComponent} from './componente/auftrag-dashboard/pruefung-ware-packmittel/pruefung-ware-packmittel.component';
import { PruefungBilanzierungComponent } from './componente/auftrag-dashboard/pruefung-bilanzierung/pruefung-bilanzierung.component';
import { VernichtungsprotokollComponent } from './componente/auftrag-dashboard/vernichtungsprotokoll/vernichtungsprotokoll.component';
import { ProzessSchritteLinienComponent } from './componente/auftrag-dashboard/prozess-schritte-linien/prozess-schritte-linien.component';
import { VariableDruckdatenComponent } from './componente/auftrag-dashboard/variable-druckdaten/variable-druckdaten.component';
import { VariableDruckdatenDetailComponent } from './componente/auftrag-dashboard/variable-druckdaten/variable-druckdaten-detail/variable-druckdaten-detail.component';
import { PruefgewichtErmittelnComponent } from './componente/auftrag-dashboard/pruefgewicht-ermitteln/pruefgewicht-ermitteln.component';
import { KontrollwaageKalibrierenComponent } from './componente/auftrag-dashboard/kontrollwaage-kalibrieren/kontrollwaage-kalibrieren.component';
import {AusschussFotograferenComponent } from './componente/auftrag-dashboard/ausschuss-fotograferen/ausschuss-fotograferen.component';
import { NachweisKuehiketteComponent } from './componente/auftrag-dashboard/nachweis-kuehikette/nachweis-kuehikette.component';
import { WareneingangspruefungComponent } from './componente/auftrag-dashboard/wareneingangspruefung/wareneingangspruefung.component';
const routes: Routes = [
  {
    path: '',
    component: AnimatedLoginComponent
  },
  {
    path: 'login',
    component: AnimatedLoginComponent
  },
  { path: '', redirectTo: '', pathMatch: 'full' },
  {
    path: 'dashboard/:orderNumber',
    component: AuftragDashboardComponent,
    canActivate: [AuthGuard, LicenseGuard, RightsGuard],
    data: { requiredRights: ['hadigi'] }
  },
  {
    path: 'dashboard',
    component: AuftragDashboardComponent, // Die Hauptkomponente, die die Sidebar und andere Hauptinhalte enthält
   canActivate: [AuthGuard],  // Schützen Sie diese Route, sodass nur angemeldete Benutzer darauf zugreifen können
  },
 
  { path: 'WareneingangspruefungComponent', component: WareneingangspruefungComponent , canActivate: [AuthGuard, LicenseGuard, RightsGuard],
    data: { requiredRight: 'admin' }  },
  { path: 'PruefungWarePackmittelComponent', component: PruefungWarePackmittelComponent , canActivate: [AuthGuard, LicenseGuard, RightsGuard],
    data: { requiredRight: 'admin' }  },
    { path: 'KontrollwaageKalibrierenComponent', component: KontrollwaageKalibrierenComponent , canActivate: [AuthGuard, LicenseGuard, RightsGuard],
      data: { requiredRight: 'admin' }  },
      { path: 'AusschussFotograferenComponent', component: AusschussFotograferenComponent , canActivate: [AuthGuard, LicenseGuard, RightsGuard],
        data: { requiredRight: 'admin' }  },
        { path: 'NachweisKuehiketteComponent', component: NachweisKuehiketteComponent , canActivate: [AuthGuard, LicenseGuard, RightsGuard],
          data: { requiredRight: 'admin' }  },
    { path: 'PruefungBilanzierungComponent', component: PruefungBilanzierungComponent , canActivate: [AuthGuard, LicenseGuard, RightsGuard],
      data: { requiredRight: 'admin' }  },


      { path: 'VernichtungsprotokollComponent', component: VernichtungsprotokollComponent , canActivate: [AuthGuard, LicenseGuard, RightsGuard],
        data: { requiredRight: 'admin' }  },
        { path: 'ProzessSchritteLinienComponent', component: ProzessSchritteLinienComponent , canActivate: [AuthGuard, LicenseGuard, RightsGuard],
          data: { requiredRight: 'admin' }  },
          { path: 'PruefgewichtErmittelnComponent', component: PruefgewichtErmittelnComponent , canActivate: [AuthGuard, LicenseGuard, RightsGuard],
            data: { requiredRight: 'admin' }  },
          { path: 'VariableDruckdatenComponent', component: VariableDruckdatenComponent , canActivate: [AuthGuard, LicenseGuard, RightsGuard],
            data: { requiredRight: 'admin' }  
          ,
        children: [
          { path: ':pos', component: VariableDruckdatenDetailComponent }
        ] },
        { path: 'ProfileGuard', component: ProfileGuard , canActivate: [AuthGuard, LicenseGuard, RightsGuard],},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { 


}
