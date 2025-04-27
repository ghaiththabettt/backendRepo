import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogTitle,
  MatDialogContent,
  MatDialogActions,
  MatDialogClose,
} from '@angular/material/dialog';
import { Component, Inject, OnDestroy } from '@angular/core'; // Added OnDestroy
import { MyLeavesService } from '../../my-leaves.service'; // Correct service path
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar'; // Import Snackbar for feedback
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'; // <--- IMPORT SPINNER MODULE
import { CommonModule } from '@angular/common'; // <--- IMPORT CommonModule for @if

// Ensure this interface matches the data passed from MyLeavesComponent
export interface DialogData {
  id: number;
  type: string; // For display
  status: string; // Needed for the delete check
  reason?: string; // Make reason optional if not always needed for display
  fromDate?: string; // Add more fields if needed for display
  toDate?: string;   // Add more fields if needed for display
}

@Component({
    selector: 'app-my-leaves-delete', // Ensure selector is correct
    templateUrl: './delete.component.html',
    styleUrls: ['./delete.component.scss'],
    standalone: true, // Make sure it's standalone if others are
    imports: [
      CommonModule, // <--- ADD CommonModule FOR @if
      MatDialogTitle,
      MatDialogContent,
      MatDialogActions,
      MatButtonModule,
      MatDialogClose,
      MatProgressSpinnerModule,
    ]
})
export class MyLeavesDeleteComponent {
  isDeleting = false; // Flag to disable button during deletion
  private destroy$ = new Subject<void>();

  constructor(
    public dialogRef: MatDialogRef<MyLeavesDeleteComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    public myLeavesService: MyLeavesService, // Use the correct service
    private snackBar: MatSnackBar // Inject Snackbar
  ) {
     // Basic check if required data is present
     if (!data || data.id == null || !data.status) {
        console.error("Delete Dialog Error: Missing required data (id or status).", data);
        // Optionally close the dialog with an error or show a message
        // this.dialogRef.close(false);
     }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  confirmDelete(): void {
    // Prevent double clicks
    if (this.isDeleting) {
      return;
    }
    this.isDeleting = true;

    // Call the service method with ID and STATUS
    this.myLeavesService.deleteMyLeaves(this.data.id, this.data.status)
      .pipe(takeUntil(this.destroy$)) // Auto-unsubscribe
      .subscribe({
        next: (deletedId) => {
          // console.log('Delete successful for ID:', deletedId);
          // Close the dialog and return true (or the ID) to signal success
          this.dialogRef.close(true);
          this.showNotification('snackbar-success', 'Leave request deleted successfully!', 'bottom', 'center');
        },
        error: (error) => {
          console.error('Delete Error:', error);
          this.isDeleting = false; // Re-enable button on error
          // Show specific error message from the service if available
          this.showNotification('snackbar-danger', error.message || 'Failed to delete leave request.', 'bottom', 'center');
          // Optionally close dialog with false on error, or keep it open
          // this.dialogRef.close(false);
        },
        // No need for complete if using takeUntil, but good practice otherwise
        // complete: () => { this.isDeleting = false; }
    });
  }

  // Close the dialog without deleting
  onNoClick(): void {
    this.dialogRef.close(false); // Return false to indicate cancellation
  }

  // Helper method for Snackbar notifications
  showNotification(
    colorName: string,
    text: string,
    placementFrom: 'top' | 'bottom',
    placementAlign: 'start' | 'center' | 'end'
  ): void {
    this.snackBar.open(text, '', {
      duration: 3000,
      verticalPosition: placementFrom,
      horizontalPosition: placementAlign,
      panelClass: colorName,
    });
  }
}