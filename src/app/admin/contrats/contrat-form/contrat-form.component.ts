import { Component, OnInit, OnDestroy, Inject } from '@angular/core'; // Import Inject
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router'; // Keep Router in case you need navigation after closing
import { ContratService } from '../contrat.service';
import { Contrat, EmployeeLite } from '../contrat.model';
import { UnsubscribeOnDestroyAdapter } from '@shared';
import { Observable, of } from 'rxjs';
import { EmployeeService } from 'services/employee.service';
import { catchError, tap } from 'rxjs/operators'; // Import tap

// Import Angular Material Dialog components
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon'; // Assuming Material Icons are used
import { MatButtonModule } from '@angular/material/button'; // Assuming Material Buttons are used
import { HttpClient, HttpErrorResponse } from '@angular/common/http'; // Ensure HttpErrorResponse is imported

@Component({
  selector: 'app-contrat-form', // Selector for this component
  templateUrl: './contrat-form.component.html',
  styleUrls: ['./contrat-form.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    // Add other Angular Material modules used in the template (e.g., MatFormFieldModule, MatInputModule, MatSelectModule)
    MatIconModule,
    MatButtonModule,
  ],
})
export class ContratFormComponent extends UnsubscribeOnDestroyAdapter implements OnInit, OnDestroy {

  contratForm: FormGroup;
  loading = false;
  contratId: number | null = null; // Will store the ID if editing
  isEditing = false; // Flag to indicate if in edit mode

  selectedFile: File | null = null; // For new file upload
  currentFileName: string | null = null; // To display existing file name

  contractTypes = ['FULL_TIME', 'PART_TIME', 'TEMPORARY', 'INTERNSHIP', 'FREELANCE']; // Match backend enum names
  statutOptions = ['ACTIF', 'NON_ACTIF']; // Match backend enum names
  employees$: Observable<EmployeeLite[]> = of([]);

  constructor(
    private fb: FormBuilder,
    private contratService: ContratService,
    // private router: Router, // Keep Router if you navigate *from* the dialog (less common)
    private employeeService: EmployeeService,
    // Inject MatDialogRef to close the dialog
    public dialogRef: MatDialogRef<ContratFormComponent>,
    // Inject data passed to the dialog (the contract object for editing)
    @Inject(MAT_DIALOG_DATA) public data: Contrat | null // Data can be a Contrat object (for edit) or null (for add)
  ) {
    super();
    // Initialize the form
    this.contratForm = this.fb.group({
      contractType: ['', [Validators.required]],
      startDate: ['', [Validators.required]], // HTML date input gives string YYYY-MM-DD
      endDate: [null], // Optional date
      renewalDate: [null], // Optional date
      reference: ['', [Validators.required]],
      description: [null], // Optional string
      statut: ['', [Validators.required]],
      employeeId: [null, [Validators.required]], // Employee ID is mandatory
    });
  }

   ngOnInit(): void { // Use override for ngOnDestroy base class method
    this.loadEmployeesForDropdown();

    // Check if data was passed (meaning we are in edit mode)
    if (this.data) {
      this.isEditing = true;
      this.contratId = this.data.contractId || null; // Store the ID
      // Patch form value with the received data
      this.contratForm.patchValue({
        contractType: this.data.contractType,
        startDate: this.data.startDate, // Assumes backend sends date as YYYY-MM-DD string or Angular handles Date conversion
        endDate: this.data.endDate, // Assumes backend sends date as YYYY-MM-DD string or Angular handles Date conversion
        renewalDate: this.data.renewalDate, // Assumes backend sends date as YYYY-MM-DD string or Angular handles Date conversion
        reference: this.data.reference,
        description: this.data.description,
        statut: this.data.statut,
        // *** Patch the employeeId form control from the nested employee object ***
        employeeId: this.data.employee?.id || null // Use optional chaining to access nested id
      });
      // Store the existing file name if available
      this.currentFileName = this.data.fileName || null;
      console.log('Contrat chargé dans la modale pour modification:', this.data);
    } else {
      // If no data, it's an add operation. Form is already initialized empty.
      this.isEditing = false;
      this.contratId = null;
      console.log('Modale ouverte pour ajouter un contrat');
       // Set default statut for add operation if needed
       // this.contratForm.get('statut')?.setValue('ACTIF');
    }
  }

  loadEmployeesForDropdown(): void {
     this.employees$ = this.employeeService.getEmployeesSimpleList().pipe(
        catchError((error: HttpErrorResponse) => { // Type error
          console.error('Erreur lors du chargement des employés', error);
           // Show error message (e.g., a Snackbar within the dialog)
          alert('Erreur lors du chargement de la liste des employés.'); // Simple alert for now
          return of([]); // Return empty array
        }),
         tap(employees => console.log('Employees loaded for dropdown:', employees))
     );
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Add file type and size validation here
      if (file.type !== 'application/pdf') {
          alert('Seuls les fichiers PDF sont autorisés.');
          this.selectedFile = null;
          event.target.value = null; // Clear the input
          return;
      }
       const maxFileSize = 15 * 1024 * 1024; // 15 MB
       if (file.size > maxFileSize) {
           alert(`Le fichier est trop volumineux (max ${maxFileSize / (1024*1024)} MB).`);
            this.selectedFile = null;
            event.target.value = null; // Clear the input
            return;
       }
      this.selectedFile = file;
      console.log('Fichier sélectionné pour update:', file.name, file.type, file.size);
      this.currentFileName = null; // Hide the 'current file' text when a new file is selected
    } else {
      this.selectedFile = null;
      console.log('Aucun nouveau fichier sélectionné');
       // If the user clears the input, keep the currentFileName displayed if it exists
       // (Unless you add a specific way to signal file removal)
    }
  }

    // Helper to remove the selected NEW file before submitting
    removeSelectedFile(): void {
        this.selectedFile = null;
        // Reset the file input element
        const fileInput = document.getElementById('fileInput') as HTMLInputElement; // Assumes id="fileInput" in HTML
        if (fileInput) {
            fileInput.value = '';
        }
        console.log('Nouveau fichier sélectionné retiré');
         // If there was an original file, show its name again
         if (this.data?.fileName) {
            this.currentFileName = this.data.fileName;
         }
    }


  onSubmit(): void {
    // Use contratForm.valid check only
    if (this.contratForm.valid) {
      this.loading = true;
      // Get all form values
      const formValues = this.contratForm.value;

       // Prepare the payload
       // *** CORRECTED PAYLOAD CONSTRUCTION with explicit parsing ***
       const contratPayload: Partial<Contrat> = { // Use Partial as some fields like 'employee' object or 'contractId' (on creation) are not included
         // Include all fields expected by the backend DTO for contract creation/update
         contractType: formValues.contractType,
         startDate: formValues.startDate,
         // Send null for optional date fields if the form value is an empty string or null
         endDate: formValues.endDate ? formValues.endDate : null,
         renewalDate: formValues.renewalDate ? formValues.renewalDate : null,
         reference: formValues.reference,
         // Send null for optional string fields if the form value is an empty string or null
         description: formValues.description ? formValues.description : null,
         statut: formValues.statut,
         // *** FIX IS HERE: Send employeeId directly as a field, ENSURING IT'S A NUMBER ***
         employeeId: formValues.employeeId // This is now correctly parsed as number (Long on backend)
         // *** DO NOT include the nested 'employee' object here ***
         // employee: { id: formValues.employeeId } as EmployeeLite // <-- REMOVE OR COMMENT OUT THIS LINE
      };
      // *** END CORRECTED PAYLOAD CONSTRUCTION ***


      console.log('Submitting contract data payload:', contratPayload); // Log the *correct* payload structure


      // Check if it's an add or edit operation
      const saveObservable = this.isEditing && this.contratId !== null
        // If editing, call update service
        ? this.contratService.updateContrat(this.contratId, contratPayload, this.selectedFile)
        // If adding, call add service
        // This path might be used if this modal is used for add too, ensure it matches AddContratComponent's logic
        : this.contratService.addContrat(contratPayload, this.selectedFile);


      // Subscribe to the chosen observable
      this.subs.sink = saveObservable.subscribe({
        next: (savedContrat) => {
          this.loading = false;
          console.log('Contrat sauvegardé avec succès', savedContrat);
          // Close the dialog and pass the saved contract back to the component that opened it
          this.dialogRef.close(savedContrat); // Close the dialog
          // Optionally, show a success message using a Snackbar/Toast in the calling component
        },
        // Use HttpErrorResponse type for detailed error handling
        error: (error: HttpErrorResponse) => {
          this.loading = false;
          console.error('Erreur lors de la sauvegarde du contrat', error);
          // Display error message to the user within the dialog or as a Snackbar
          const backendErrorMessage = error.error?.message || error.error; // Check for 'message' field or the whole error body
          const errorMessage = backendErrorMessage || error.statusText || 'Une erreur est survenue lors de la sauvegarde.';
          alert('Erreur: ' + errorMessage); // Simple alert within the dialog
           // Or use Snackbar: this.snackBar.open('Erreur: ' + errorMessage, 'Fermer', { duration: 5000 });
        }
      });
    } else {
        // If form is invalid, display validation errors
        this.contratForm.markAllAsTouched();
        console.warn('Formulaire invalide');
         if(this.contratId === null && this.isEditing) { // Check if we intended to edit but ID is missing
            alert("Erreur interne: ID du contrat manquant pour la mise à jour.");
         } else {
             alert("Veuillez corriger les erreurs du formulaire."); // General invalid form message
         }
        // Optionally, highlight invalid fields or show a message
    }
  }

   // Helper function to get form control errors
    getFormControlErrors(controlName: string): any {
        const control = this.contratForm.get(controlName);
        // Check if the control is invalid AND has been touched or is dirty
        if (control?.invalid && (control?.dirty || control?.touched)) {
            return control?.errors; // Return the errors object (e.g., { required: true })
        }
        return null; // No errors to display for validation messages
    }

    // Method to close the dialog without saving
    onCancel(): void {
        this.dialogRef.close(); // Close dialog, passing no result
    }

     // Added ngOnDestroy implementation (required by extending base class)
     override ngOnDestroy(): void { // Add 'override' keyword
      super.ngOnDestroy(); // Call the base class method to unsubscribe from subscriptions
    }
}