import { Routes } from '@angular/router';
import { AllExpensesComponent } from './all-expenses/all-expenses.component';

export const EXPENSES_ROUTES: Routes = [
  {
    path: '',
    component: AllExpensesComponent
  }
];
