import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { Employee } from 'app/admin/departments/all-departments/department.model'; // Créez ce modèle si nécessaire

@Component({
  selector: 'app-employees-list-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule],
  template: `
    <h2 mat-dialog-title>Employees in {{ data.department.departmentName }}</h2>
    <div mat-dialog-content>
      <p *ngIf="!data.employees || data.employees.length === 0">No employees available.</p>
      <ul *ngIf="data.employees && data.employees.length > 0">
        <li *ngFor="let employee of data.employees">
          {{ employee.name }} {{ employee.lastName }} ({{ employee.email }})
        </li>
      </ul>
    </div>
    <div mat-dialog-actions>
      <button mat-button mat-dialog-close>Close</button>
    </div>
  `
})
export class EmployeesListDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: { department: any, employees: Employee[] }) {}
}
