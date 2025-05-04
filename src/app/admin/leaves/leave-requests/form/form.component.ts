import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogContent, MatDialogClose } from '@angular/material/dialog';
import { LeavesService } from '../leaves.service';
import { Validators, UntypedFormGroup, UntypedFormBuilder, ReactiveFormsModule, FormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { Leaves } from '../leaves.model';
import { DatePipe, formatDate, CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import {  Subscription } from 'rxjs';
import { startWith, takeUntil, map as rxMap, debounceTime } from 'rxjs/operators';
import { EmployeeService } from 'app/admin/leaves/leave-requests/employee.service'; // Ajustez le chemin si nécessaire
import { EmployeeListItem} from 'models/employee.model';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'; // Importer le spinner
import { Observable, Subject, combineLatest, of } from 'rxjs'; // Import 'of'
import { map , switchMap, filter } from 'rxjs/operators'; // Import 'switchMap', 'filter'
import { HttpErrorResponse } from '@angular/common/http'; // <--- ADD OR MODIFY THIS LINE

export interface DialogData {
  id?: number;
  action: 'add' | 'edit' | 'details';
  leaves: Leaves;
}

@Component({
  selector: 'app-leave-request-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatDialogContent,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatSelectModule,
    MatOptionModule,
    MatDialogClose,
    MatCardModule,
    DatePipe,
    MatProgressSpinnerModule
  ]
})
export class LeaveRequestFormComponent implements OnInit, OnDestroy {
  action: 'add' | 'edit' | 'details';
  dialogTitle: string = 'Leave Request';
  isDetails: boolean = false;
  leavesForm!: UntypedFormGroup;
  leaves: Leaves;
  isLoading = false;
  isEmployeeListLoading = false;
  employeeListError: string | null = null;

  employees: EmployeeListItem[] = []; // Includes departmentName

  private destroy$ = new Subject<void>();

  leaveTypes: string[] = ['ANNUAL', 'SICK', 'MEDICAL', 'MATERNITY', 'CASUAL'];
  durationTypes: string[] = ['FULL_DAY', 'HALF_DAY'];
  statuses: string[] = ['PENDING', 'APPROVED', 'REJECTED']; // Use this for the dropdown

  constructor(
    public dialogRef: MatDialogRef<LeaveRequestFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    public leavesService: LeavesService,
    private employeeService: EmployeeService,
    private fb: UntypedFormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.action = data.action;
    this.leaves = data.leaves ? new Leaves(data.leaves) : new Leaves({ employeeId: undefined, status: 'PENDING' }); // Default status for 'add'
    this.setupFormMode();
    this.leavesForm = this.createLeaveForm();
  }

  ngOnInit(): void {
    if (this.action === 'add' || this.action === 'edit') {
       this.loadEmployees();
    }
    if (!this.isDetails) {
      this.setupAutomaticDayCalculation();
      this.setupDepartmentAutoPopulation(); // <-- Ensure this is called
    }

    if (this.isDetails) {
        this.leavesForm.disable();
    } else if (this.action === 'edit') {
       // Disable employee change in edit mode
       this.leavesForm.get('employeeId')?.disable();
       // Status field is now enabled by default via createLeaveForm
       this.calculateLeaveDays();
       // Department will be set by setupDepartmentAutoPopulation via startWith
    } else { // Mode 'add'
       this.calculateLeaveDays();
       // Department will be populated when employee is selected
       // Status defaults to PENDING and is selectable
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadEmployees(): void {
    this.isEmployeeListLoading = true;
    this.employeeListError = null;
    this.employeeService.getEmployeeListForDropdown()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (empList) => {
          this.employees = empList;
          this.isEmployeeListLoading = false;
          // If editing, manually trigger department update for the initial value
          if (this.action === 'edit' && this.leavesForm.get('employeeId')?.value) {
             this.updateDepartmentField(this.leavesForm.get('employeeId')?.value);
          }
        },
        error: (err) => {
          console.error("Failed to load employees:", err);
          this.employeeListError = "Could not load employee list.";
          this.isEmployeeListLoading = false;
        }
      });
  }

  private setupFormMode(): void {
    // ... (no changes needed here) ...
    if (this.action === 'details') {
        this.isDetails = true;
        this.dialogTitle = `Details: ${this.leaves.name || 'Leave Request'}`;
    } else if (this.action === 'edit') {
        this.dialogTitle = `Edit: ${this.leaves.name || 'Leave Request'}`;
        this.isDetails = false;
    } else { // 'add'
        this.dialogTitle = 'New Leave Request';
        this.isDetails = false;
    }
  }

  private createLeaveForm(): UntypedFormGroup {
    const fromDate = this.leaves.from ? formatDate(this.leaves.from, 'yyyy-MM-dd', 'en') : null;
    const leaveToDate = this.leaves.leaveTo ? formatDate(this.leaves.leaveTo, 'yyyy-MM-dd', 'en') : null;

    return this.fb.group({
      // name: [{ value: this.leaves.name, disabled: true }], // REMOVED
      employeeId: [this.leaves.employeeId || null, [Validators.required]],
      department: [{ value: this.leaves.department, disabled: true }], // Still disabled, auto-populated
      type: [this.leaves.type, [Validators.required]],
      from: [fromDate, [Validators.required]],
      leaveTo: [leaveToDate, [Validators.required]],
      noOfDays: [{ value: this.leaves.noOfDays, disabled: true }, [Validators.required, Validators.min(0.5)]],
      durationType: [this.leaves.durationType || 'FULL_DAY', [Validators.required]],
      // --- Status Control Modification ---
      // Make it editable, default to PENDING for new requests. Add Validators.required.
      status: [this.leaves.status || 'PENDING', [Validators.required]],
      // --- End Status Control Modification ---
      reason: [this.leaves.reason, [Validators.required]],
      note: [this.leaves.note],
      // Info fields remain disabled
      requestedOn: [{ value: this.leaves.requestedOn ? formatDate(this.leaves.requestedOn, 'yyyy-MM-dd', 'en') : null, disabled: true }],
      approvedBy: [{ value: this.leaves.approvedBy, disabled: true }],
      approvalDate: [{ value: this.leaves.approvalDate ? formatDate(this.leaves.approvalDate, 'yyyy-MM-dd', 'en') : null, disabled: true }],
    }, { validators: this.dateRangeValidator });
  }

  // --- This method should exist from previous step ---
  private setupDepartmentAutoPopulation(): void {
    const employeeControl = this.leavesForm.get('employeeId');
    if (!employeeControl) return;

    employeeControl.valueChanges
      .pipe(
        startWith(employeeControl.value),
        filter(employeeId => employeeId !== null && employeeId !== undefined),
        takeUntil(this.destroy$)
      )
      .subscribe(employeeId => {
        this.updateDepartmentField(employeeId);
      });
  }

  // --- This helper should exist from previous step ---
  private updateDepartmentField(employeeId: number): void {
    // --- LOG 4: EMPLOYEE ID BEING PROCESSED ---
    console.log(`[LeaveRequestFormComponent] updateDepartmentField called for employeeId: ${employeeId}`);
    // ------------------------------------------

    // --- LOG 5: THE LIST OF EMPLOYEES STORED IN THE COMPONENT ---
    console.log('[LeaveRequestFormComponent] Current this.employees:', JSON.stringify(this.employees));
    // -------------------------------------------------------------

    const selectedEmployee = this.employees.find(emp => emp.id === employeeId);

    // --- LOG 6: THE EMPLOYEE OBJECT FOUND IN THE COMPONENT LIST ---
    console.log('[LeaveRequestFormComponent] Found employee item:', selectedEmployee ? JSON.stringify(selectedEmployee) : 'null');
    // -----------------------------------------------------------

    // Use 'N/A' as fallback if employee not found OR departmentName is missing/null/empty
    const departmentName = selectedEmployee?.departmentName || 'N/A'; // Default to 'N/A'

    // --- LOG 7: THE DEPARTMENT NAME BEING SET TO THE FORM CONTROL ---
    console.log(`[LeaveRequestFormComponent] Setting department form control value to: '${departmentName}'`);
    // -----------------------------------------------------------------

    this.leavesForm.get('department')?.setValue(departmentName, { emitEvent: false });
 }


  // --- dateRangeValidator (keep as is) ---
  private dateRangeValidator(control: AbstractControl): ValidationErrors | null {
    const from = control.get('from')?.value;
    const to = control.get('leaveTo')?.value;
    if (from && to) {
        const fromDate = new Date(from);
        const toDate = new Date(to);
        if (toDate < fromDate) {
             control.get('leaveTo')?.setErrors({ ...control.get('leaveTo')?.errors, dateInvalid: true });
            return { dateRange: true };
        } else {
             const errors = { ...control.get('leaveTo')?.errors };
             delete errors['dateInvalid'];
             if (Object.keys(errors).length === 0) {
                 control.get('leaveTo')?.setErrors(null);
             } else {
                  control.get('leaveTo')?.setErrors(errors);
             }
        }
    }
    return null;
  };

  // --- setupAutomaticDayCalculation (keep as is) ---
  private setupAutomaticDayCalculation(): void {
    // ... (implementation from previous step) ...
    const fromControl = this.leavesForm.get('from');
    const toControl = this.leavesForm.get('leaveTo');
    const durationControl = this.leavesForm.get('durationType');

    if (!fromControl || !toControl || !durationControl) return;

    combineLatest([
      fromControl.valueChanges.pipe(startWith(fromControl.value)),
      toControl.valueChanges.pipe(startWith(toControl.value)),
      durationControl.valueChanges.pipe(startWith(durationControl.value))
    ])
    .pipe(
        debounceTime(150),
        takeUntil(this.destroy$)
    )
    .subscribe(() => {
      this.calculateLeaveDays();
    });
  }

  // --- calculateLeaveDays (keep as is) ---
  private calculateLeaveDays(): void {
    // ... (implementation from previous step) ...
        const fromValue = this.leavesForm.get('from')?.value;
    const toValue = this.leavesForm.get('leaveTo')?.value;
    const durationType = this.leavesForm.get('durationType')?.value;
    const noOfDaysControl = this.leavesForm.get('noOfDays');

    if (!noOfDaysControl) return; // Sécurité

    if (fromValue && toValue) {
      try {
        const startDate = new Date(fromValue);
        const endDate = new Date(toValue);

        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime()) || endDate < startDate) {
          noOfDaysControl.setValue(0, { emitEvent: false });
          return;
        }

        let calculatedDays = 0;
        let currentDate = new Date(startDate);

        while (currentDate <= endDate) {
          const dayOfWeek = currentDate.getDay();
          if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Exclude Sunday (0) and Saturday (6)
            calculatedDays++;
          }
          currentDate.setDate(currentDate.getDate() + 1);
        }

        if (calculatedDays >= 1 && durationType === 'HALF_DAY') {
           if (calculatedDays === 1) {
               calculatedDays = 0.5;
           } else {
               console.warn("HALF_DAY selected for leave spanning multiple weekdays. Calculating as full days.");
           }
        } else if (calculatedDays === 0 && startDate.getDay() !== 0 && startDate.getDay() !== 6 && startDate.getTime() === endDate.getTime() && durationType === 'HALF_DAY') {
             calculatedDays = 0.5;
        }

        noOfDaysControl.setValue(calculatedDays, { emitEvent: false });

      } catch (e) {
        console.error("Error parsing dates for calculation:", e);
        noOfDaysControl.setValue(0, { emitEvent: false });
      }
    } else {
      noOfDaysControl.setValue(0, { emitEvent: false });
    }
  }

  // --- getErrorMessage (keep as is) ---
  getErrorMessage(controlName: string): string {
    // ... (implementation from previous step) ...
    const control = this.leavesForm.get(controlName);
    if (!control) return '';
    if (control.hasError('required')) {
      return 'Required field';
    } else if (control.hasError('minlength')) {
      return 'Minimum length required';
    } else if (control.hasError('min')) {
      return 'Value too low';
    } else if (control.hasError('dateInvalid')) {
        return '"Leave To" date cannot be before "Leave From" date.';
    }
    return '';
  }

  submit(): void {
    this.leavesForm.markAllAsTouched();
    this.leavesForm.updateValueAndValidity();

    if (this.leavesForm.valid) {
      this.isLoading = true;
      const formValue = this.leavesForm.getRawValue(); // Get all values, including status

      // Construct the data to send
      // The status field will now be included from formValue
      const leaveData: Partial<Leaves> = {
        id: this.leaves.id,
        employeeId: formValue.employeeId,
        type: formValue.type,
        from: formValue.from,
        leaveTo: formValue.leaveTo,
        noOfDays: formValue.noOfDays,
        durationType: formValue.durationType,
        reason: formValue.reason,
        note: formValue.note,
        status: formValue.status // Status is now included from the form
      };

      let operation: Observable<Leaves>;

      if (this.action === 'edit') {
        if (!leaveData.id) {
            console.error("Cannot update leave without ID.");
            this.showNotification('snackbar-danger', 'Error: Leave ID is missing.', 'bottom', 'center');
            this.isLoading = false;
            return;
        }
        operation = this.leavesService.updateLeaves(leaveData as Leaves);
      } else { // 'add'
        // Backend should ideally enforce 'PENDING' status on creation,
        // even if the frontend sends something else.
        operation = this.leavesService.addLeaves(leaveData as Leaves);
      }

      operation.subscribe({
        next: (response: Leaves) => {
          this.isLoading = false;
          this.showNotification(
            this.action === 'edit' ? 'black' : 'snackbar-success',
            `Leave request ${this.action === 'edit' ? 'updated' : 'added'} successfully!`,
            'bottom',
            'center'
          );
          this.dialogRef.close(response);
        },
        error: (error: Error | HttpErrorResponse) => { // Catch HttpErrorResponse too
          this.isLoading = false;
          console.error(`${this.action} Error:`, error);
          // Try to get a more specific message from HttpErrorResponse
          let message = 'Please try again.';
          if (error instanceof HttpErrorResponse) {
            message = error.error?.message || error.message;
          } else if (error instanceof Error) {
            message = error.message;
          }
          const errorMessage = `Failed to ${this.action} leave request. ${message}`;
          this.showNotification('snackbar-danger', errorMessage, 'bottom', 'center');
        },
      });
    } else {
      console.log('Form is invalid:', this.leavesForm.errors);
      Object.keys(this.leavesForm.controls).forEach(key => {
        const controlErrors = this.leavesForm.get(key)?.errors;
         if (controlErrors != null) {
          console.error('Key = ' + key + ', errors = ' + JSON.stringify(controlErrors));
          this.leavesForm.get(key)?.markAsTouched();
         }
       });
      this.showNotification(
        'snackbar-warning',
        'Please fill all required fields correctly.',
        'bottom',
        'center'
      );
    }
  }


  onNoClick(): void {
    this.dialogRef.close();
  }


  // --- Approve/Reject Actions (inchangées, ferment maintenant la modale) ---
  approve(): void {
    if (!this.leaves.id) return;
    this.isLoading = true;
    this.leavesService.approveLeave(this.leaves.id).subscribe({
        next: (updatedLeave: Leaves) => {
            this.isLoading = false;
            this.showNotification('snackbar-success', 'Leave request approved!', 'bottom', 'center');
            this.dialogRef.close(updatedLeave); // Ferme et renvoie les données à jour
        },
        error: (err: Error) => {
            this.isLoading = false;
            console.error("Approve failed:", err);
             const errorMessage = `Failed to approve request. ${err.message || 'Please try again.'}`;
            this.showNotification('snackbar-danger', errorMessage, 'bottom', 'center');
        }
    });
  }

  reject(): void {
    if (!this.leaves.id) return;
    this.isLoading = true;
    this.leavesService.rejectLeave(this.leaves.id).subscribe({
        next: (updatedLeave: Leaves) => {
            this.isLoading = false;
            this.showNotification('snackbar-danger', 'Leave request rejected', 'bottom', 'center');
            this.dialogRef.close(updatedLeave); // Ferme et renvoie les données à jour
        },
        error: (err: Error) => {
            this.isLoading = false;
            console.error("Reject failed:", err);
             const errorMessage = `Failed to reject request. ${err.message || 'Please try again.'}`;
            this.showNotification('snackbar-danger', errorMessage, 'bottom', 'center');
        }
    });
  }

  showNotification(
    colorName: string,
    text: string,
    placementFrom: MatSnackBarVerticalPosition,
    placementAlign: MatSnackBarHorizontalPosition
  ) {
    this.snackBar.open(text, '', {
      duration: 3000,
      verticalPosition: placementFrom,
      horizontalPosition: placementAlign,
      panelClass: colorName,
    });
  }
}