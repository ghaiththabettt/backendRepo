import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
// Import ParamMap from @angular/router
import { ActivatedRoute, Router, ParamMap } from '@angular/router';
import { ContratService } from '../contrat.service';
import { Contrat, EmployeeLite } from '../contrat.model';
import { UnsubscribeOnDestroyAdapter } from '@shared';
import { Observable, of } from 'rxjs';
import { EmployeeService } from 'services/employee.service';
// Import map, filter, switchMap, tap from rxjs/operators
import { catchError, filter, switchMap, tap, map } from 'rxjs/operators';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-edit-contrat',
  templateUrl: './edit-contrat.component.html',
  styleUrls: ['./edit-contrat.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule, MatButtonModule],
})
export class EditContratComponent extends UnsubscribeOnDestroyAdapter implements OnInit, OnDestroy {
  contratForm: FormGroup;
  loading = false;
  contratId: number | null = null; // Store the ID
  selectedFile: File | null = null;
  currentFileName: string | null = null;

  contractTypes = ['FULL_TIME', 'PART_TIME', 'TEMPORARY', 'INTERNSHIP', 'FREELANCE'];
  statutOptions = ['ACTIF', 'NON_ACTIF'];
  employees$: Observable<EmployeeLite[]> = of([]);

  constructor(
    private fb: FormBuilder,
    private contratService: ContratService,
    private router: Router,
    private route: ActivatedRoute, // Inject ActivatedRoute
    private employeeService: EmployeeService
  ) {
    super();
    this.contratForm = this.fb.group({
      contractType: ['', [Validators.required]],
      startDate: ['', [Validators.required]],
      endDate: [null],
      renewalDate: [null],
      reference: ['', [Validators.required]],
      description: [null],
      statut: ['', [Validators.required]],
      employeeId: [null, [Validators.required]],
    });
  }

  ngOnInit(): void {
    this.loadEmployeesForDropdown();

    // Get the contract ID from the route parameters and load the contract
    this.subs.sink = this.route.paramMap.pipe(
      // Explicitly type params as ParamMap
      filter((params: ParamMap) =>
        // Check if 'id' parameter exists and is a valid number string
        params.has('id') && !isNaN(+params.get('id')!) // + converts to number, !isNaN checks if it's not Not-a-Number
      ),
      // Explicitly type params as ParamMap
      // Map to the ID (converted to number), assert the type as number
      map((params: ParamMap) => +params.get('id')! as number), // <-- Corrected line with type assertion
      // Store the ID
      tap(id => this.contratId = id),
      // Use switchMap to fetch the contract based on the ID
      switchMap(id => {
         this.loading = true; // Show loading indicator
         return this.contratService.getContratById(id).pipe(
             catchError(error => {
               this.loading = false; // Hide loading on error
               console.error('Erreur lors du chargement du contrat pour modification', error);
               // Handle contract not found (e.g., navigate back to list with error message)
               this.router.navigate(['/admin/contrats/all-contrats']); // Navigate away on error
               alert('Contrat non trouvé.'); // Simple user feedback
               return of(null); // Return null to stop the pipe from emitting
             })
         );
      })
    ).subscribe(contract => {
      // This callback only runs if the switchMap observable (contratService.getContratById) emits
      if (contract) {
        // Patch form value with fetched data
        this.contratForm.patchValue({
          contractType: contract.contractType,
          startDate: contract.startDate,
          endDate: contract.endDate,
          renewalDate: contract.renewalDate,
          reference: contract.reference,
          description: contract.description,
          statut: contract.statut,
          // Set the employee dropdown value
          employeeId: contract.employee?.id || null
        });
        // Store the existing file name if available
        this.currentFileName = contract.fileName || null;
        console.log('Contrat chargé pour modification:', contract);
      }
      // loading = false is handled in the switchMap's catchError or after the inner observable completes (implicitly here)
      // Adding it here too is redundant if switchMap's inner observable always completes or errors.
    },
    // Optional: Add error callback for the outer observable chain if needed (less common)
    (error) => {
        console.error("Error in route param processing:", error); // Should not happen with the filter/catchError setup
        this.loading = false;
    },
    // Optional: Add complete callback
    () => {
       this.loading = false; // Ensure loading is off when the entire chain completes
    }
    );
  }


  loadEmployeesForDropdown(): void {
     this.employees$ = this.employeeService.getEmployeesSimpleList().pipe(
        catchError(error => {
          console.error('Erreur lors du chargement des employés', error);
           alert('Erreur lors du chargement de la liste des employés.');
          return of([]);
        }),
         tap(employees => console.log('Employees loaded:', employees))
     );
  }

   onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        console.error('Seuls les fichiers PDF sont autorisés.');
        alert('Erreur : Seuls les fichiers PDF sont autorisés.');
        this.selectedFile = null;
        event.target.value = null;
        return;
      }
       const maxFileSize = 15 * 1024 * 1024; // Example: 15MB
       if (file.size > maxFileSize) {
           console.error('Le fichier est trop volumineux.');
           alert('Erreur : Le fichier est trop volumineux (max ' + maxFileSize / (1024 * 1024) + 'MB).');
           this.selectedFile = null;
           event.target.value = null;
           return;
       }

      this.selectedFile = file;
      console.log('Fichier sélectionné pour update:', file.name, file.type, file.size);
      this.currentFileName = null; // Hide the 'current file' text when a new file is selected
    } else {
      this.selectedFile = null;
      console.log('Aucun nouveau fichier sélectionné');
       // If the user clears the input, the selectedFile becomes null.
       // We do NOT restore currentFileName here automatically, as the user might intend to remove the file
       // (though our backend doesn't currently support explicit removal without replacement).
       // If the user clears the input, they won't upload a *new* file, and the backend keeps the old one.
    }
  }

    // Optional: Method to remove the selected NEW file before submitting
    removeSelectedFile(): void {
        this.selectedFile = null;
        // Reset the file input element
        const fileInput = document.getElementById('fileInput') as HTMLInputElement;
        if (fileInput) {
            fileInput.value = '';
        }
        // Decide if you want to show the currentFileName again if the user cancels a *new* file selection
        // If you had a variable storing the original loaded fileName, you could restore it here.
        // For now, just clearing the selectedFile is sufficient.
        // Re-loading the contract would show the original file name.
    }


  onSubmit(): void {
    if (this.contratForm.valid && this.contratId !== null) {
      this.loading = true;
      const formValues = this.contratForm.value;

       const contratPayload: Partial<Contrat> = {
         contractType: formValues.contractType,
         startDate: formValues.startDate,
         endDate: formValues.endDate || null,
         renewalDate: formValues.renewalDate || null,
         reference: formValues.reference,
         description: formValues.description || null,
         statut: formValues.statut,
         employee: { id: formValues.employeeId } as EmployeeLite
      };

      this.subs.sink = this.contratService.updateContrat(this.contratId, contratPayload, this.selectedFile).subscribe({
        next: (updatedContrat) => {
          this.loading = false;
          console.log('Contrat mis à jour avec succès', updatedContrat);
          // Show success message (e.g., a toast)
          this.router.navigate(['/admin/contrats/all-contrats']); // Navigate back to the list
          alert('Contrat mis à jour avec succès.'); // Simple user feedback
        },
        error: (error) => {
          this.loading = false;
          console.error('Erreur lors de la mise à jour du contrat', error);
          const errorMessage = error.error || 'Une erreur est survenue lors de la mise à jour du contrat.';
          alert('Erreur: ' + errorMessage); // Simple alert
        }
      });
    } else {
        this.contratForm.markAllAsTouched();
        console.warn('Formulaire invalide ou ID de contrat manquant');
         if(this.contratId === null) {
            alert("Erreur interne: ID du contrat manquant pour la mise à jour.");
         } else {
             alert("Veuillez corriger les erreurs du formulaire.");
         }
    }
  }

    getFormControlErrors(controlName: string): any {
        const control = this.contratForm.get(controlName);
        if (control?.invalid && (control?.dirty || control?.touched)) {
            return control?.errors;
        }
        return null;
    }

     // Added ngOnDestroy to explicitly call unsubscribe (though UnsubscribeOnDestroyAdapter does this)
     // It's good practice to have the method even if the base class handles it.
     override ngOnDestroy(): void { // <--- ADDED 'override'
      super.ngOnDestroy(); // Call the base class method to unsubscribe
    }

}