import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AllContratsComponent } from './all-contrats/all-contrats.component';
import { AddContratComponent } from './add-contrat/add-contrat.component';

const routes: Routes = [
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

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ContratsRoutingModule { }
