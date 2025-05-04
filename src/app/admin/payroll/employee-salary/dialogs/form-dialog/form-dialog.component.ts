import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'; // <-- Importez le 
import { EmployeeSalary } from '../../employee-salary.model';
import { EmployeeService } from 'services/employee.service'; 
import { EmployeeLite } from 'app/admin/contrats/contrat.model';
import {  MatOptionModule } from '@angular/material/core';
// Correction : Importer MatDialogModule et MatDialogRef depuis @angular/material/dialog
import { MatDialogModule} from '@angular/material/dialog';

// Correction : Importer MatNativeDateModule et MatOptionModule depuis @angular/material/core

@Component({
  selector: 'app-employee-salary-form',
  templateUrl: './form-dialog.component.html',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    MatSelectModule,     // Module pour <mat-select>
    MatOptionModule,
    MatDialogModule
       // <-- Module pour <mat-option>
  ]
})
export class EmployeeSalaryFormComponent implements OnInit { // <-- Ajout de OnInit
  form: FormGroup;
  employees: EmployeeLite[] = [];
  isLoadingEmployees = false;
  isEditMode: boolean;

  constructor(
    public dialogRef: MatDialogRef<EmployeeSalaryFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: EmployeeSalary | null,
    private fb: FormBuilder,
    private employeeService: EmployeeService
  ) {
    this.isEditMode = !!this.data;

    this.form = this.fb.group({
      employeeId: [
        this.data?.employeeId,
        this.isEditMode ? [] : [Validators.required]
      ],
      basicSalary: [this.data?.basicSalary || 0, [Validators.required, Validators.min(0)]],
      bonuses: [this.data?.bonuses || 0, Validators.min(0)],
      deductions: [this.data?.deductions || 0, Validators.min(0)],
      totalSalary: [{ value: this.data?.totalSalary || 0, disabled: true }],
      payDate: [
        this.data?.payDate ? new Date(this.data.payDate) : new Date(),
        Validators.required
      ]
    });

    if (this.isEditMode) {
      this.form.get('employeeId')?.disable();
    }

    this.subscribeToAutoCalculate();
  }

  // Implémentation de ngOnInit
  ngOnInit(): void {
    if (!this.isEditMode) {
      this.loadEmployees();
    }
  }

  loadEmployees(): void {
    this.isLoadingEmployees = true;
    this.employeeService.getEmployeesSimpleList().subscribe({
      next: (data) => {
        this.employees = data;
        this.isLoadingEmployees = false;
      },
      error: (err) => {
        console.error("Erreur chargement employés:", err);
        this.isLoadingEmployees = false;
      }
    });
  }

  subscribeToAutoCalculate(): void {
    this.form.get('basicSalary')?.valueChanges.subscribe(() => this.calculateTotal());
    this.form.get('bonuses')?.valueChanges.subscribe(() => this.calculateTotal());
    this.form.get('deductions')?.valueChanges.subscribe(() => this.calculateTotal());
  }

  calculateTotal(): void {
    const basic = +this.form.get('basicSalary')?.value || 0;
    const bonus = +this.form.get('bonuses')?.value || 0;
    const deductions = +this.form.get('deductions')?.value || 0;
    const total = basic + bonus - deductions;
    this.form.get('totalSalary')?.setValue(total.toFixed(2));
  }

  save(): void {
    if (this.form.valid) {
      const formValue = this.form.getRawValue();
      const result: EmployeeSalary = {
        payrollId: this.data?.payrollId,
        employeeId: formValue.employeeId,
        basicSalary: +formValue.basicSalary,
        bonuses: +formValue.bonuses,
        deductions: +formValue.deductions,
        totalSalary: (+formValue.basicSalary + +formValue.bonuses - +formValue.deductions),
        payDate: this.formatDate(formValue.payDate)
      };
      this.dialogRef.close(result);
    } else {
      this.form.markAllAsTouched();
    }
  }

  private formatDate(date: Date | string | null): string {
    if (!date) return '';
    const d = new Date(date);
    const month = '' + (d.getMonth() + 1);
    const day = '' + d.getDate();
    const year = d.getFullYear();
    return [year, month.padStart(2, '0'), day.padStart(2, '0')].join('-');
  }

  cancel(): void {
    this.dialogRef.close();
  }
}