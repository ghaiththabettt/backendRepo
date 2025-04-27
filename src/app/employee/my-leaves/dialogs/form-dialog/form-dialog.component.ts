// src/app/employee/my-leaves/dialogs/form-dialog/form-dialog.component.ts
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogContent, MatDialogClose } from '@angular/material/dialog';
import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { Validators, UntypedFormGroup, UntypedFormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule, TitleCasePipe, formatDate } from '@angular/common';
import { Subject, Observable } from 'rxjs';
import { takeUntil, catchError } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';

import { MyLeaves } from '../../my-leaves.model';
import { MyLeavesService } from '../../my-leaves.service';

export interface DialogData {
  id?: number;
  action: 'add' | 'edit';
  myLeaves: MyLeaves;
}

@Component({
    selector: 'app-my-leaves-form',
    templateUrl: './form-dialog.component.html',
    styleUrls: ['./form-dialog.component.scss'],
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatButtonModule,
        MatIconModule,
        MatDialogContent,
        MatDialogClose, // Added MatDialogClose here
        MatFormFieldModule,
        MatInputModule,
        MatDatepickerModule,
        MatSelectModule,
        MatOptionModule,
        MatProgressSpinnerModule,
        TitleCasePipe,
    ],
    providers: [TitleCasePipe] // Provide if used in template
})
export class MyLeavesFormComponent implements OnInit, OnDestroy {
  action: 'add' | 'edit';
  dialogTitle: string;
  myLeavesForm: UntypedFormGroup; // Using Untyped for compatibility with template
  myLeaves: MyLeaves;

  leaveTypes$: Observable<string[]>;
  isLoadingTypes = true;
  loadingError: string | null = null;

  isSubmitting = false;
  private destroy$ = new Subject<void>();

  constructor(
    public dialogRef: MatDialogRef<MyLeavesFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    public myLeavesService: MyLeavesService,
    private fb: UntypedFormBuilder, // Using Untyped for compatibility
    private snackBar: MatSnackBar
  ) {
    this.action = data.action;
    this.myLeaves = data.action === 'edit' ? { ...data.myLeaves } : new MyLeaves({});
    this.dialogTitle = this.action === 'edit' ? 'Edit Leave Request' : 'New Leave Request';

    // ** CORRECTED Form Definition **
    this.myLeavesForm = this.fb.group({
      applyDate: [this.myLeaves.applyDate || formatDate(new Date(), 'yyyy-MM-dd', 'en'), [Validators.required]],
      fromDate: [this.myLeaves.fromDate || '', [Validators.required]],
      toDate: [this.myLeaves.toDate || '', [Validators.required]],
      durationType: [this.myLeaves.durationType || 'FULL_DAY', [Validators.required]], // Changed from halfDay, default FULL_DAY
      type: [this.myLeaves.type || '', [Validators.required]],
      reason: [this.myLeaves.reason || '', [Validators.required, Validators.maxLength(500)]],
    });

    // Initialize observable for leave types
    this.leaveTypes$ = this.myLeavesService.getLeaveTypes().pipe(
        catchError(err => {
            console.error("Error fetching leave types in constructor pipeline:", err);
            this.loadingError = "Could not load leave types. Using defaults.";
            this.isLoadingTypes = false;
            // Attempt to use fallback from service
            return this.myLeavesService.getLeaveTypes();
        })
    );
  }

  ngOnInit() {
    this.isLoadingTypes = true;
    this.loadingError = null;
    this.leaveTypes$.pipe(takeUntil(this.destroy$)).subscribe({
        next: (types) => {
            this.isLoadingTypes = false;
             // Ensure types is an array before proceeding
            if (!Array.isArray(types)) {
                console.error("Received non-array data for leave types:", types);
                this.loadingError = "Invalid leave type data received.";
                types = []; // Set to empty array to avoid errors later
            }

            // Patch type and durationType if editing
            if (this.action === 'edit') {
                const currentTypeUpper = this.myLeaves.type?.toUpperCase();
                if (currentTypeUpper && types.includes(currentTypeUpper)) {
                    this.myLeavesForm.patchValue({ type: currentTypeUpper });
                } else if (this.myLeaves.type) {
                    console.warn(`Leave type '${this.myLeaves.type}' not found in available types:`, types);
                }

                if (this.myLeaves.durationType) {
                    this.myLeavesForm.patchValue({ durationType: this.myLeaves.durationType });
                }
            }
            if (!this.loadingError && types.length === 0) {
                this.loadingError = "No leave types available.";
            }
        },
        error: (err) => {
            console.error("Error subscribing to leave types in component:", err);
            if (!this.loadingError) {
                this.loadingError = "An error occurred while loading leave types.";
            }
            this.isLoadingTypes = false;
        }
    });
  }


  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  submit(): void {
    if (this.myLeavesForm.valid) {
      this.isSubmitting = true;
      const formValue = this.myLeavesForm.getRawValue();

      // Format dates explicitly before creating leaveData
      const formattedDates = {
          applyDate: formValue.applyDate ? formatDate(formValue.applyDate, 'yyyy-MM-dd', 'en-US') : null,
          fromDate: formValue.fromDate ? formatDate(formValue.fromDate, 'yyyy-MM-dd', 'en-US') : null,
          toDate: formValue.toDate ? formatDate(formValue.toDate, 'yyyy-MM-dd', 'en-US') : null,
      };

       // Combine original data (like id, status) with form data including formatted dates
      const leaveData: MyLeaves = {
        ...this.myLeaves,          // Include id and original status if editing
        applyDate: formattedDates.applyDate ?? this.myLeaves.applyDate, // Use formatted or original
        fromDate: formattedDates.fromDate ?? this.myLeaves.fromDate,
        toDate: formattedDates.toDate ?? this.myLeaves.toDate,
        durationType: formValue.durationType, // From form
        type: formValue.type,               // From form
        reason: formValue.reason,           // From form
      };

      let operation$: Observable<MyLeaves>;
      if (this.action === 'edit') {
         if (!leaveData.id) {
            console.error("Cannot update leave request without an ID.");
            this.showNotification('snackbar-danger', 'Error: Missing request ID for update.', 'bottom', 'center');
            this.isSubmitting = false;
            return;
         }
         operation$ = this.myLeavesService.updateMyLeaves(leaveData);
      } else {
         operation$ = this.myLeavesService.addMyLeaves(leaveData);
      }

      operation$.pipe(takeUntil(this.destroy$)).subscribe({
         next: (response) => {
            this.isSubmitting = false;
            this.dialogRef.close(response); // Success
         },
         error: (error) => {
            this.isSubmitting = false;
            console.error(`${this.action === 'edit' ? 'Update' : 'Add'} Error:`, error);
            this.showNotification('snackbar-danger', error.message || `Failed to ${this.action} leave request.`, 'bottom', 'center');
         },
      });
    } else {
        this.myLeavesForm.markAllAsTouched();
        this.showNotification('snackbar-warning', 'Please fill all required fields correctly.', 'bottom', 'center');
    }
  }

  onNoClick(): void {
    this.dialogRef.close(); // Close without saving
  }

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