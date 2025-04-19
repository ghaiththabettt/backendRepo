import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { Policy } from 'app/admin/departments/all-departments/department.model'; // Créez ce modèle si nécessaire

@Component({
  selector: 'app-policies-list-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule],
  template: `
    <h2 mat-dialog-title>Policies for {{ data.department.departmentName }}</h2>
    <div mat-dialog-content>
      <p *ngIf="!data.policies || data.policies.length === 0">No policies available.</p>
      <ul *ngIf="data.policies && data.policies.length > 0">
        <li *ngFor="let policy of data.policies">
          {{ policy.policyName }} - {{ policy.description }}
        </li>
      </ul>
    </div>
    <div mat-dialog-actions>
      <button mat-button mat-dialog-close>Close</button>
    </div>
  `
})
export class PoliciesListDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: { department: any, policies: Policy[] }) {}
}
