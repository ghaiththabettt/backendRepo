import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTableDataSource } from '@angular/material/table';
import { EmployeeSalary } from './employee-salary.model';
import { EmployeeSalaryService } from './employee-salary.service';
import { SelectionModel } from '@angular/cdk/collections';
import { EmployeeSalaryFormComponent } from './dialogs/form-dialog/form-dialog.component';
import { Inject } from '@angular/core';
// Correction : Importer MatDialogModule et MatDialogRef depuis @angular/material/dialog
import {  MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators,  } from '@angular/forms';

import { MatSelectModule } from '@angular/material/select';

// Import du composant Breadcrumb
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';
// Import du module du spinner
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
// Import du module pour le tooltip
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-employee-salary',
  standalone: true,
  templateUrl: './employee-salary.component.html',
  styleUrls: ['./employee-salary.component.scss'],
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatIconModule,
    MatButtonModule,
    MatCheckboxModule,
    MatDialogModule,
    FormsModule,
    ReactiveFormsModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    EmployeeSalaryFormComponent,
    BreadcrumbComponent,
    MatProgressSpinnerModule,
    MatTooltipModule
  ]
})
export class EmployeeSalaryComponent implements OnInit {
  displayedColumns: string[] = [
    'employeeName', // Affiché
    'employeeEmail', // Affiché (ajouté)
    'employeeDepartment', // Affiché
    'basicSalary', // Affiché
    'bonuses',     // Affiché
    'deductions',  // Affiché
    'totalSalary', // Affiché
    'payDate',     // Affiché
    'actions'      // Affiché
  ];

  dataSource = new MatTableDataSource<EmployeeSalary>([]);
  selection = new SelectionModel<EmployeeSalary>(true, []);
  isLoading: boolean = false;
  isSidebarVisible: boolean = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('filter') filter!: ElementRef;

  constructor(
    private salaryService: EmployeeSalaryService, // Service Payroll
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.load(); // Charge les données au démarrage
  }

  // Charge ou recharge les données de la table
  load(): void {
    this.isLoading = true; // Affiche le spinner
    this.salaryService.getAll().subscribe({ // Appelle le service getAll (qui mappe les données)
      next: (data) => {
        this.dataSource.data = data; // Met à jour les données de la table
        // Configure le paginator et le tri après avoir reçu les données
        if (this.paginator) this.dataSource.paginator = this.paginator;
        if (this.sort) this.dataSource.sort = this.sort;
        this.isLoading = false; // Cache le spinner
      },
      error: (error) => { // Gestion d'erreur
        console.error("Erreur lors du chargement des fiches de paie:", error);
        this.snackBar.open('Error loading payroll data', 'Error', { duration: 3000 });
        this.isLoading = false; // Cache le spinner même en cas d'erreur
      }
    });
  }

  // Applique le filtre sur la table
  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage(); // Retourne à la première page après filtrage
    }
  }

  // Ouvre le dialogue pour ajouter ou modifier une fiche de paie
  openDialog(salary?: EmployeeSalary): void {
    const dialogRef = this.dialog.open(EmployeeSalaryFormComponent, {
      width: '600px', // Ajustez la largeur si nécessaire
      disableClose: true, // Empêche la fermeture en cliquant à l'extérieur
      data: salary ? { ...salary } : null // Passe une copie des données pour l'édition, ou null pour l'ajout
    });

    dialogRef.afterClosed().subscribe((result: EmployeeSalary | undefined) => {
      // 'result' contient les données du formulaire si sauvegardé, sinon undefined
      if (result) {
        this.isLoading = true; // Affiche le spinner pendant l'opération
        if (result.payrollId) {
          // --- Mise à jour ---
          this.salaryService.update(result).subscribe({
            next: () => {
              this.load(); // Recharge les données après succès
              this.snackBar.open('Payroll updated successfully', 'OK', { duration: 3000 });
            },
            error: (err) => {
              console.error("Erreur lors de la mise à jour:", err);
              this.snackBar.open('Error updating payroll', 'Error', { duration: 3000 });
              this.isLoading = false;
            }
          });
        } else {
          // --- Ajout ---
          this.salaryService.add(result).subscribe({
            next: () => {
              this.load(); // Recharge les données après succès
              this.snackBar.open('Payroll added successfully', 'OK', { duration: 3000 });
            },
            error: (err) => {
              console.error("Erreur lors de l'ajout:", err);
              // Affichez un message plus spécifique si possible (ex: err.error.message)
              const errorMsg = err.error?.message || 'Error adding payroll';
              this.snackBar.open(errorMsg, 'Error', { duration: 3000 });
              this.isLoading = false;
            }
          });
        }
      }
       // Si result est undefined (dialogue annulé), ne fait rien.
    });
  }

  // Supprime une fiche de paie
  delete(id: number | undefined): void {
    if (id === undefined) {
      console.error("Tentative de suppression avec un ID indéfini.");
      return; // Ne rien faire si l'ID est indéfini
    }
    // Optionnel: Ajouter une confirmation avant suppression
    // if (confirm('Are you sure you want to delete this payroll entry?')) { ... }

    this.isLoading = true;
    this.salaryService.delete(id).subscribe({
      next: () => {
        this.load(); // Recharge les données après succès
        this.snackBar.open('Payroll deleted successfully', 'OK', { duration: 3000 });
      },
      error: (err) => {
        console.error("Erreur lors de la suppression:", err);
        this.snackBar.open('Error deleting payroll', 'Error', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }
}