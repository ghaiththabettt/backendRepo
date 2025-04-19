import { Component, Inject, OnInit } from '@angular/core';
import { TrainingListService } from 'app/admin/training/training-list/training-list.service';
import { TrainerInfo, TrainingDTO } from 'app/admin/training/training-list/training-list.model';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms'; // nécessaire pour ngModel
import { NgIf, NgFor } from '@angular/common';

@Component({
  selector: 'app-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgIf,
    NgFor,
    MatDialogModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './form-dialog.component.html',
  styleUrls: ['./form-dialog.component.scss']
})
export class FormDialogComponent implements OnInit {
  trainings: TrainingDTO[] = [];
  selectedTrainingId!: number;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: TrainerInfo,
    private dialogRef: MatDialogRef<FormDialogComponent>,
    private trainingService: TrainingListService
  ) {}

  ngOnInit(): void {
    this.trainingService.getAllTrainings().subscribe({
      next: (res) => (this.trainings = res),
      error: (err) => console.error('Failed to load trainings', err)
    });
  }

  updateTraining(): void {
    this.trainingService.updateEmployeeTraining(this.data.email, this.selectedTrainingId).subscribe({
      next: () => this.dialogRef.close(true),
      error: (err) => console.error('Update failed', err)
    });
  }
}
