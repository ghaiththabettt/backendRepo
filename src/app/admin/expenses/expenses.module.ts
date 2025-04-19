import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { EXPENSES_ROUTES } from './expenses.routes';
import { AllExpensesComponent } from './all-expenses/all-expenses.component';
import { FormDialogComponent } from './all-expenses/dialog/form-dialog/form-dialog.component';
import { DeleteDialogComponent } from './all-expenses/dialog/delete/delete.component';
import { ExpenseService } from './expense.service';
import { EmployeeService } from './employee.service';
import { CurrencyPipe, DatePipe } from '@angular/common';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(EXPENSES_ROUTES),
    AllExpensesComponent,
    FormDialogComponent,
    DeleteDialogComponent
  ],
  providers: [
    ExpenseService,
    EmployeeService,
    CurrencyPipe,
    DatePipe
  ]
})
export class ExpensesModule { }
