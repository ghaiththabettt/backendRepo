import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ContratService } from '../contrat.service';
import { Contrat } from '../contrat.model';
import { UnsubscribeOnDestroyAdapter } from '@shared';
import { Observable, of , throwError} from 'rxjs';
import { EmployeeLite } from '../contrat.model';
import { EmployeeService } from 'services/employee.service';
import { catchError } from 'rxjs/operators';
import { ContratFormComponent } from '../contrat-form/contrat-form.component';
import { MatDialog } from '@angular/material/dialog'; // Importez MatDialog
import { HttpClient, HttpErrorResponse } from '@angular/common/http'; // Ensure HttpErrorResponse is imported
import {  tap } from 'rxjs/operators'; // Ensure tap is imported
import {  OnDestroy } from '@angular/core'; // Add OnDestroy

@Component({
  selector: 'app-add-contrat',
  templateUrl: './add-contrat.component.html',
  styleUrls: ['./add-contrat.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
})
export class AddContratComponent extends UnsubscribeOnDestroyAdapter implements OnInit, OnDestroy {  
  contratForm: FormGroup;
  loading = false;

  selectedFile: File | null = null;

  contractTypes = ['FULL_TIME', 'PART_TIME', 'TEMPORARY', 'INTERNSHIP', 'FREELANCE']; // Ensure these match backend enum names
  statutOptions = ['ACTIF', 'NON_ACTIF']; // Ensure these match backend enum names
  employees$: Observable<EmployeeLite[]> = of([]);

  constructor(
    private fb: FormBuilder,
    private contratService: ContratService,
    private router: Router,
    private employeeService: EmployeeService,
    // private dialog: MatDialog // Remove if not used in this component
  ) {
    super();
    this.contratForm = this.fb.group({
      contractType: ['', [Validators.required]],
      startDate: ['', [Validators.required]], // HTML date input gives string YYYY-MM-DD
      endDate: [null], // Optional date
      renewalDate: [null], // Optional date
      reference: ['', [Validators.required]],
      description: [null], // Optional string
      statut: ['NON_ACTIF', [Validators.required]], // Defaulting status
      employeeId: [null, [Validators.required]], // Employee ID is mandatory for creating a contract
    });
  }

  ngOnInit(): void {
    this.loadEmployeesForDropdown();
  }

  loadEmployeesForDropdown(): void {
     this.employees$ = this.employeeService.getEmployeesSimpleList().pipe(
        catchError((error: HttpErrorResponse) => { // Type error
          console.error('Erreur lors du chargement des employés', error);
          // Improve user feedback for loading employees failure
          alert('Erreur lors du chargement de la liste des employés. Impossible d\'ajouter un contrat sans sélectionner un employé.');
          return of([]); // Return empty array to avoid crashing, but disable the select if needed
        }),
        tap(employees => console.log('Employees loaded for dropdown:', employees)) // Log data
     );
  }

  onFileSelected(event: any): void {
    // ... (your existing file selection logic) ...
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
        console.log('Fichier sélectionné:', file.name, file.type, file.size);
    } else {
        this.selectedFile = null;
        console.log('Aucun fichier sélectionné');
    }
  }

  removeSelectedFile(): void {
      this.selectedFile = null;
      // Reset the file input element value to clear the selection
      const fileInput = document.getElementById('fileInput') as HTMLInputElement;
      if (fileInput) {
          fileInput.value = '';
      }
      console.log('Fichier sélectionné retiré');
  }


  onSubmit(): void {
    // Use contratForm.valid check only
    if (this.contratForm.valid) {
      this.loading = true;
      // Get all form values
      const formValues = this.contratForm.value;

      // *** Ensure employeeId is a number ***
      // Get the value and explicitly convert it to a number.
      // Use a default of null or 0 if the parsing fails unexpectedly (though form validation should prevent this).
      const employeeIdAsNumber = formValues.employeeId !== null && formValues.employeeId !== undefined
                                  ? parseInt(formValues.employeeId, 10) // Parse the string value
                                  : null; // Keep null if the form value was null

      // Add a check to see if parsing was successful and it's a valid number
      if (employeeIdAsNumber === null || isNaN(employeeIdAsNumber)) {
           console.error("Failed to parse employeeId as number:", formValues.employeeId);
           this.loading = false;
           alert("Erreur interne: Impossible de traiter l'ID de l'employé.");
           return; // Stop submission if ID is invalid
      }


      // Prepare the contract payload *excluding the file content itself*
      // This object will be serialized to JSON and sent as the 'contract' part of the FormData
      // *** CORRECTED PAYLOAD CONSTRUCTION using the parsed number ***
      const contratPayload: Partial<Contrat> = { // Use Partial as some fields like 'employee' object or 'contractId' (on creation) are not included
         contractType: formValues.contractType,
         startDate: formValues.startDate,
         // Ensure optional date fields send null if empty string
         endDate: formValues.endDate ? formValues.endDate : null,
         renewalDate: formValues.renewalDate ? formValues.renewalDate : null,
         reference: formValues.reference,
         // Send null for optional string fields if the form value is an empty string or null
         description: formValues.description ? formValues.description : null,
         statut: formValues.statut,
         // *** FIX IS HERE: Use the explicitly parsed number ***
         employeeId: employeeIdAsNumber // <-- Use the validated number here
         // *** DO NOT include the nested 'employee' object here ***
         // employee: { id: formValues.employeeId } as EmployeeLite // <-- REMOVE OR COMMENT OUT THIS LINE
      };
      // *** END CORRECTED PAYLOAD CONSTRUCTION ***

      console.log('Submitting contract data payload:', contratPayload); // Log the payload structure (check type of employeeId)

      // Call the service method, passing the JSON payload object and the selected file
      this.subs.sink = this.contratService.addContrat(contratPayload, this.selectedFile).subscribe({
        next: (createdContrat) => {
          this.loading = false;
          console.log('Contrat ajouté avec succès', createdContrat);
          // Show success message (e.g., using MatSnackBar)
           // this.snackBar.open('Contrat ajouté avec succès', 'Fermer', { duration: 3000 });
          this.router.navigate(['/admin/contrats/all-contrats']); // Navigate after success
          alert('Contrat ajouté avec succès !'); // Simple alert for user feedback
        },
        // Use HttpErrorResponse type for detailed error handling
        error: (error: HttpErrorResponse) => {
          this.loading = false;
          console.error('Erreur lors de l\'ajout du contrat', error);
          // Attempt to extract a user-friendly error message from the backend response
          const backendErrorMessage = error.error?.message || error.error; // Check for 'message' field or the whole error body
          const errorMessage = backendErrorMessage || error.statusText || 'Une erreur est survenue lors de l\'ajout du contrat.';
          alert('Erreur: ' + errorMessage); // Simple alert
           // this.snackBar.open('Erreur: ' + errorMessage, 'Fermer', { duration: 5000 });
        }
      });
    } else {
        // If form is invalid, display validation errors
        this.contratForm.markAllAsTouched();
        console.warn('Formulaire invalide');
        alert('Veuillez remplir tous les champs obligatoires.'); // Simple alert
        // Optionally, show validation errors to the user using a Snackbar or by highlighting fields
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

    // Added ngOnDestroy implementation (required by extending base class)
    override ngOnDestroy(): void { // Add 'override' keyword
      super.ngOnDestroy(); // Call the base class method to unsubscribe from subscriptions
    }
}