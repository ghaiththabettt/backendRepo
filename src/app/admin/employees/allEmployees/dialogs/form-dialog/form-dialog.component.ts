import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogContent,
  MatDialogClose,
} from '@angular/material/dialog';
import { Component, Inject } from '@angular/core';
import {
  UntypedFormControl,
  Validators,
  UntypedFormGroup,
  UntypedFormBuilder,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { formatDate } from '@angular/common';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { Employee } from 'models/employee.model';
import { EmployeeService } from 'services/employee.service';

export interface DialogData {
  employee?: Employee;
  action: 'add' | 'edit';
}

@Component({
  selector: 'app-all-employees-form',
  templateUrl: './form-dialog.component.html',
  styleUrls: ['./form-dialog.component.scss'],
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatDialogContent,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatDatepickerModule,
    MatDialogClose,
  ],
})
export class AllEmployeesFormComponent {
  action: 'add' | 'edit';
  dialogTitle: string;
  employeesForm: UntypedFormGroup;
  employees: Employee;

  constructor(
    public dialogRef: MatDialogRef<AllEmployeesFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    public employeeService: EmployeeService,
    private fb: UntypedFormBuilder
  ) {
    this.action = data.action;
    this.employees = this.action === 'edit' ? data.employee! : ({} as Employee);

    this.dialogTitle =
      this.action === 'edit'
        ? `Edit Employee: ${this.employees.name}`
        : 'New Employee';

    this.employeesForm = this.createEmployeeForm();
  }

  createEmployeeForm(): UntypedFormGroup {
    return this.fb.group({
      id: [this.employees.id],
      name: [this.employees.name, [Validators.required]],
      lastName: [this.employees.lastName],
      email: [this.employees.email, [Validators.required, Validators.email]],
      dateOfBirth: [
        this.employees.dateOfBirth
          ? formatDate(this.employees.dateOfBirth, 'yyyy-MM-dd', 'en')
          : '',
        [Validators.required],
      ],
      position: [this.employees.position, [Validators.required]],
      phoneNumber: [this.employees.phoneNumber, [Validators.required]],
      departmentId: [this.employees.departmentId, [Validators.required]],
      contractId: [this.employees.contractId],
      hireDate: [
        this.employees.hireDate
          ? formatDate(this.employees.hireDate, 'yyyy-MM-dd', 'en')
          : '',
        [Validators.required],
      ],
      salary: [this.employees.salary, [Validators.required]],
      address: [this.employees.address],
    });
  }

  submit(): void {
    if (this.employeesForm.valid) {
      const employeeData: Employee = this.employeesForm.getRawValue();

      if (this.action === 'add') {
        this.employeeService.createEmployee(employeeData).subscribe({
          next: (res) => this.dialogRef.close(res),
          error: (err) => console.error('Add Error', err),
        });
      } else {
        this.employeeService
          .updateEmployee(employeeData.id!, employeeData)
          .subscribe({
            next: (res) => this.dialogRef.close(res),
            error: (err) => console.error('Update Error', err),
          });
      }
    }
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}
