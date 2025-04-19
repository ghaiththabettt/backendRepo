import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { Expense, TypeExpense, StatusExpense, Employee } from '../../../expense.model';
import { EmployeeService } from '../../../employee.service';

@Component({
  selector: 'app-form-dialog',
  templateUrl: './form-dialog.component.html',
  styleUrls: ['./form-dialog.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule
  ]
})
export class FormDialogComponent implements OnInit {
  expenseForm: FormGroup;
  dialogTitle: string;
  expenseTypes = Object.values(TypeExpense);
  expenseStatuses = Object.values(StatusExpense);
  employees: Employee[] = [];
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private employeeService: EmployeeService,
    public dialogRef: MatDialogRef<FormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { expense?: Expense; action: 'add' | 'edit' }
  ) {
    this.dialogTitle = data.action === 'add' ? 'Add Expense' : 'Edit Expense';
    
    this.expenseForm = this.fb.group({
      expenseId: [data.expense?.expenseId || 0],
      type: [data.expense?.type || '', [Validators.required]],
      amount: [data.expense?.amount || '', [Validators.required, Validators.min(0)]],
      date: [data.expense?.date ? new Date(data.expense.date) : new Date(), [Validators.required]],
      status: [data.expense?.status || StatusExpense.Pending, [Validators.required]],
      employee: [data.expense?.employee || null, [Validators.required]]
    });
  }

  ngOnInit() {
    this.loadEmployees();
  }

  private loadEmployees() {
    this.isLoading = true;
    this.employeeService.getAllEmployees().subscribe({
      next: (employees) => {
        this.employees = employees;
        // Si nous sommes en mode édition, présélectionnons l'employé
        if (this.data.expense?.employee) {
          const selectedEmployee = this.employees.find(e => e.id === this.data.expense?.employee.id);
          if (selectedEmployee) {
            this.expenseForm.patchValue({ employee: selectedEmployee });
          }
        }
      },
      error: (error) => {
        console.error('Error loading employees:', error);
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  onSubmit() {
    if (this.expenseForm.valid) {
      const formValue = this.expenseForm.value;
      const expense = {
        expenseId: formValue.expenseId,
        type: formValue.type,
        amount: formValue.amount,
        date: new Date(formValue.date),
        status: formValue.status,
        employeeId: formValue.employee.id  // Extraction de l'id de l'employé sélectionné
      };
      this.dialogRef.close(expense);
    }
  }

  onCancel() {
    this.dialogRef.close();
  }

  compareEmployees(e1: Employee, e2: Employee): boolean {
    return e1 && e2 ? e1.id === e2.id : e1 === e2;
  }
}
