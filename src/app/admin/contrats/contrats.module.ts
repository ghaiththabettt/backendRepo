import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContratsRoutingModule } from './contrats-routing.module';
import { AllContratsComponent } from './all-contrats/all-contrats.component';
import { AddContratComponent } from './add-contrat/add-contrat.component';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    ContratsRoutingModule,
    ReactiveFormsModule,
    AllContratsComponent,
    AddContratComponent
  ]
})
export class ContratsModule { }
