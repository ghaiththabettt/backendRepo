import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { PerksService } from '../perks.service';
import { Perks, PerksType } from '../perks.model';

@Component({
  selector: 'app-edit-perks',
  templateUrl: './edit-perks.component.html',
  styleUrls: ['./edit-perks.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    RouterModule
  ]
})
export class EditPerksComponent implements OnInit {
  perksForm: UntypedFormGroup;
  perksId: number = 0; 
  perksTypes = Object.values(PerksType);

  constructor(
    private fb: UntypedFormBuilder,
    private perksService: PerksService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.perksForm = this.fb.group({
      employeeId: ['', [Validators.required]],
      perksType: ['', [Validators.required]],
      datePerks: ['', [Validators.required]],
      reason: ['', [Validators.required]]
    });
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.perksId = +params['id'];
      this.loadPerksData();
    });
  }

  loadPerksData() {
    this.perksService.getPerksById(this.perksId).subscribe({
      next: (perks) => {
        this.perksForm.patchValue({
          employeeId: perks.employeeId,
          perksType: perks.perksType,
          datePerks: perks.datePerks,
          reason: perks.reason
        });
      },
      error: () => {
        this.showNotification('error', 'Error loading perks data');
      }
    });
  }

  onSubmit() {
    if (this.perksForm.valid) {
      // Récupérer les données du formulaire et ajouter l'ID du "perk" existant.
      const perksToUpdate = { ...this.perksForm.value, perksId: this.perksId };
      
      // Utilisez la méthode `updatePerks` pour mettre à jour le "perk" existant.
      this.perksService.updatePerks(this.perksId, perksToUpdate).subscribe({
        next: () => {
          this.showNotification('success', 'Perk updated successfully');
          this.router.navigate(['/admin/perks/all-perks']);
        },
        error: (error) => {
          console.error('Error updating perk:', error);  // Log error for debugging
          this.showNotification('error', 'Error updating perk');
        }
      });
    }
  }
  
  

  private showNotification(type: string, message: string) {
    this.snackBar.open(message, '', {
      duration: 2000,
      verticalPosition: 'top',
      horizontalPosition: 'right',
      panelClass: type === 'success' ? ['success-snackbar'] : ['error-snackbar']
    });
  }
}
