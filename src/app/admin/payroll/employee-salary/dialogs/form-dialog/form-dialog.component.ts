import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { EmployeeSalary } from '../../employee-salary.model';

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
    MatNativeDateModule
  ]
})
export class EmployeeSalaryFormComponent {
  form: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<EmployeeSalaryFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: EmployeeSalary,
    private fb: FormBuilder
  ) {
    this.form = this.fb.group({
      payrollId: [data?.payrollId],
      employeeId: [data?.employeeId],
      employeeName: [data?.employeeName || '', Validators.required],
      employeeEmail: [data?.employeeEmail || '', [Validators.required, Validators.email]],
      employeeDepartment: [data?.employeeDepartment || '', Validators.required],
      basicSalary: [data?.basicSalary || 0, Validators.required],
      bonuses: [data?.bonuses || 0],
      deductions: [data?.deductions || 0],
      totalSalary: [{ value: data?.totalSalary || 0, disabled: true }],
      payDate: [data?.payDate ? new Date(data.payDate) : new Date(), Validators.required]
    });

    this.subscribeToAutoCalculate();
  }

  subscribeToAutoCalculate() {
    this.form.get('basicSalary')?.valueChanges.subscribe(() => this.calculateTotal());
    this.form.get('bonuses')?.valueChanges.subscribe(() => this.calculateTotal());
    this.form.get('deductions')?.valueChanges.subscribe(() => this.calculateTotal());
  }

  calculateTotal() {
    const basic = +this.form.get('basicSalary')?.value || 0;
    const bonus = +this.form.get('bonuses')?.value || 0;
    const deductions = +this.form.get('deductions')?.value || 0;
    const total = basic + bonus - deductions;
    this.form.get('totalSalary')?.setValue(total);
  }

  save() {
    if (this.form.valid) {
      const raw = this.form.getRawValue();
      raw.totalSalary = raw.basicSalary + raw.bonuses - raw.deductions;
      this.dialogRef.close(raw);
    }
  }

  cancel() {
    this.dialogRef.close();
  }
}
