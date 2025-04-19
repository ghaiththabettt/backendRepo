import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { Training } from 'app/admin/departments/all-departments/department.model'; // Créez ce modèle si nécessaire

@Component({
  selector: 'app-training-list-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule],
  template: `
    <h2 mat-dialog-title>Trainings for {{ data.department.departmentName }}</h2>
    <div mat-dialog-content>
      <p *ngIf="!data.trainings || data.trainings.length === 0">No trainings available.</p>
      <ul *ngIf="data.trainings && data.trainings.length > 0">
        <li *ngFor="let training of data.trainings">
          {{ training.topic }} ({{ training.startDate | date:'shortDate' }} - {{ training.endDate | date:'shortDate' }})
        </li>
      </ul>
    </div>
    <div mat-dialog-actions>
      <button mat-button mat-dialog-close>Close</button>
    </div>
  `
})
export class TrainingListDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: { department: any, trainings: Training[] }) {}
}
