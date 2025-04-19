import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogTitle,
  MatDialogContent,
  MatDialogActions,
  MatDialogClose,
} from '@angular/material/dialog';
import { Component, Inject } from '@angular/core';
// Remove LeavesService import, not needed here anymore
import { DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

export interface DialogData {
  // Only include data needed for display in the confirmation
  id: number;
  from: string;
  type: string;
  name: string;
}

@Component({
    selector: 'app-leave-request-delete',
    templateUrl: './delete.component.html',
    styleUrls: ['./delete.component.scss'],
    standalone: true, // Make it standalone
    imports: [
        MatDialogTitle,
        MatDialogContent,
        MatDialogActions,
        MatButtonModule,
        MatDialogClose,
        DatePipe,
    ]
})
export class LeaveRequestDeleteComponent {
  // Inject MAT_DIALOG_DATA to access the leave data for display
  constructor(
    public dialogRef: MatDialogRef<LeaveRequestDeleteComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {}

  // Method called when the "Delete" button is clicked
  confirmDelete(): void {
    // Close the dialog and return true to indicate confirmation
    this.dialogRef.close(true);
  }

  // Method called when the "Cancel" button is clicked
  onNoClick(): void {
    // Close the dialog and return false/undefined to indicate cancellation
    this.dialogRef.close(false);
  }
}