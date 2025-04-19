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
import type { Trainers } from '../../trainers.model';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { formatDate } from '@angular/common';
import { TrainersService } from '../../trainers.service';

export interface DialogData {
  action: string;
  trainers: Trainers;
}

@Component({
  selector: 'app-trainerss-form',
  templateUrl: './form-dialog.component.html',
  styleUrls: ['./form-dialog.component.scss'],
  providers: [{ provide: MAT_DATE_LOCALE, useValue: 'en-GB' }],
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    MatSelectModule,
    MatFormFieldModule,
    MatIconModule,
    MatButtonModule,
    MatDatepickerModule,
    MatDialogContent,
    MatDialogClose,
  ],
})
export class TrainerssFormComponent {
  action: string;
  dialogTitle: string;
  trainersForm: UntypedFormGroup;
  trainers: Partial<Trainers> = {};

  trainingTypes: string[] = ['Technical', 'Soft Skills', 'Management'];

  constructor(
    public dialogRef: MatDialogRef<TrainerssFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private fb: UntypedFormBuilder,
    private trainersService: TrainersService
  ) {
    this.action = data.action;
    this.trainers = this.action === 'edit' ? data.trainers : {};
    this.dialogTitle = this.action === 'edit' ? 'Edit Training' : 'New Training';

    this.trainersForm = this.createTrainersForm();
  }

  createTrainersForm(): UntypedFormGroup {
    return this.fb.group({
      trainingId: [this.trainers.trainingId],
      topic: [this.trainers.topic, [Validators.required, Validators.maxLength(100)]],
      trainingType: [this.trainers.trainingType, [Validators.required]],
      startDate: [this.trainers.startDate, [Validators.required]],
      endDate: [this.trainers.endDate, [Validators.required]],
    });
  }

  submit(): void {
    if (this.trainersForm.valid) {
      const formData = this.trainersForm.getRawValue();

      if (this.action === 'edit') {
        this.trainersService.updateTrainer(formData).subscribe({
          next: (response) => this.dialogRef.close(response),
          error: (error) => console.error('Update Error:', error),
        });
      } else {
        this.trainersService.addTrainer(formData).subscribe({
          next: (response) => this.dialogRef.close(response),
          error: (error) => console.error('Add Error:', error),
        });
      }
    }
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  confirmAdd(): void {
    this.submit();
  }
}
