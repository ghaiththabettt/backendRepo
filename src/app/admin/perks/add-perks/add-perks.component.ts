import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { PerksService } from '../perks.service';
import { EmployeeService } from 'services/employee.service';  // Service pour récupérer les employés
import { Perks, PerksType } from '../perks.model';
@Component({
  selector: 'app-add-perks',
  templateUrl: './add-perks.component.html',
  styleUrls: ['./add-perks.component.scss'],
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
export class AddPerksComponent implements OnInit {
  perksForm: UntypedFormGroup;
  employees: any[] = [];  // Tableau pour stocker les employés
  perksTypes = Object.values(PerksType);

  constructor(
    private fb: UntypedFormBuilder,
    private perksService: PerksService,
    private employeeService: EmployeeService,  // Service pour récupérer les employés
    private snackBar: MatSnackBar,
    private router: Router
  ) {
    this.perksForm = this.fb.group({
      employeeId: ['', [Validators.required]],
      perksType: ['', [Validators.required]],
      datePerks: ['', [Validators.required]],
      reason: ['', [Validators.required]]
    });
  }

  ngOnInit() {
    // Appeler le service pour obtenir la liste des employés
    this.employeeService.getAllEmployees().subscribe({
      next: (data) => {
        this.employees = data;  // Stocker la liste des employés
      },
      error: (error) => {
        this.showNotification('error', 'Error fetching employees');
      }
    });

    // Activer la classe active sur le formulaire si la sidebar est ouverte
    this.toggleSidebar();
  }

  onSubmit() {
    if (this.perksForm.valid) {
      this.perksService.createPerks(this.perksForm.value).subscribe({
        next: () => {
          this.showNotification('success', 'Perks added successfully');
          this.router.navigate(['/admin/perks/all-perks']);
        },
        error: () => {
          this.showNotification('error', 'Error adding perks');
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

  // Fonction pour activer ou désactiver la classe 'active' de la sidebar et du formulaire
  toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.add-perks-form');
    sidebar?.classList.toggle('active');
    mainContent?.classList.toggle('active');
  }
}