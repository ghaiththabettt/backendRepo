import { Routes } from '@angular/router';
import { AllContratsComponent } from './all-contrats/all-contrats.component';
import { AddContratComponent } from './add-contrat/add-contrat.component';

export const CONTRATS_ROUTES: Routes = [
  {
    path: 'all-contrats',
    component: AllContratsComponent
  },
  {
    path: 'add-contrat',
    component: AddContratComponent
  },
  {
    path: '',
    redirectTo: 'all-contrats',
    pathMatch: 'full'
  }
];
