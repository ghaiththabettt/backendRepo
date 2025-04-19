import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EmployeeService } from 'services/employee.service';
import { DepartmentService } from 'services/department.service';
import { ContractService } from 'services/contract.service';
import { Employee } from 'models/employee.model';
import { Department } from 'models/department.model';
import { Contract } from 'models/contract.model';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field'; // Import du module mat-form-field
import { MatInputModule } from '@angular/material/input'; // Import du module matInput
import { MatSelectModule } from '@angular/material/select'; // Import du module mat-select
import { MatOptionModule } from '@angular/material/core'; // Import du module mat-option
import { MatDatepickerModule } from '@angular/material/datepicker'; // Import du module mat-datepicker
import { MatNativeDateModule } from '@angular/material/core'; // Import du module matNativeDate
import { MatButtonModule } from '@angular/material/button'; // Import du module mat-button
import { MatSnackBarModule } from '@angular/material/snack-bar'; // Import du module mat-snack-bar
import { MatCardModule } from '@angular/material/card'; // Import du module mat-card
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-edit-employee',
  templateUrl: './edit-employee.component.html',
  styleUrls: ['./edit-employee.component.scss'],
  imports: [
    CommonModule,
    MatFormFieldModule,   // Assurez-vous que le module mat-form-field est inclus
    MatInputModule,       // Assurez-vous que matInput est inclus
    MatSelectModule,      // Assurez-vous que matSelect est inclus
    MatOptionModule,      // Assurez-vous que matOption est inclus
    MatDatepickerModule,  // Assurez-vous que matDatepicker est inclus
    MatNativeDateModule,  // Assurez-vous que matNativeDateModule est inclus
    MatButtonModule,      // Assurez-vous que matButton est inclus
    MatSnackBarModule,    // Assurez-vous que matSnackBarModule est inclus
    MatCardModule,        // Assurez-vous que matCardModule est inclus
    FormsModule,
    ReactiveFormsModule,
  ],
})
export class EditEmployeeComponent implements OnInit {
  employeeForm!: FormGroup;
  employees: Employee[] = [];
  selectedEmployeeId: number | null = null; // ID de l'employé sélectionné
  employee: Employee | null = null;
  departments: Department[] = [];
  contracts: Contract[] = [];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private employeeService: EmployeeService,
    private departmentService: DepartmentService,
    private contractService: ContractService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadEmployees(); // Charger la liste des employés
    this.loadDepartments(); // Charger les départements
    this.loadContracts(); // Charger les contrats

    // Initialisation du formulaire
    this.employeeForm = this.fb.group({
      name: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      dateOfBirth: ['', Validators.required],
      hireDate: ['', Validators.required],
      position: ['', Validators.required],
      salary: [0, Validators.required],
      address: [''],
      phoneNumber: [''],
      contractId: [null, Validators.required],
      departmentId: [null, Validators.required],
    });
  }

  // Charger la liste des employés
  loadEmployees(): void {
    this.employeeService.getAllEmployees().subscribe({
      next: (employees) => {
        this.employees = employees;
      },
      error: (err) => {
        console.error('Error loading employees:', err);
        this.snackBar.open('Error loading employees', 'Close', { duration: 3000 });
      },
    });
  }

  // Charger les départements
  loadDepartments(): void {
    this.departmentService.getAllDepartments().subscribe({
      next: (data) => (this.departments = data),
      error: (err) => {
        console.error('Error loading departments:', err);
        this.snackBar.open('Error loading departments', 'Close', { duration: 3000 });
      },
    });
  }

  // Charger les contrats
  loadContracts(): void {
    this.contractService.getAllContracts().subscribe({
      next: (data) => (this.contracts = data),
      error: (err) => {
        console.error('Error loading contracts:', err);
        this.snackBar.open('Error loading contracts', 'Close', { duration: 3000 });
      },
    });
  }

  // Méthode pour charger les données de l'employé sélectionné
  loadEmployee(): void {
    if (this.selectedEmployeeId) {
      this.employeeService.getEmployeeById(this.selectedEmployeeId).subscribe({
        next: (employee) => {
          this.employee = employee;
          this.populateForm(employee);
        },
        error: (err) => {
          console.error('Error loading employee:', err);
          this.snackBar.open('Error loading employee', 'Close', { duration: 3000 });
        },
      });
    }
  }

  // Remplir le formulaire avec les données de l'employé
  populateForm(employee: Employee): void {
    this.employeeForm.patchValue({
      name: employee.name,
      lastName: employee.lastName,
      email: employee.email,
      password: '',
      dateOfBirth: employee.dateOfBirth,
      hireDate: employee.hireDate,
      position: employee.position,
      salary: employee.salary,
      address: employee.address,
      phoneNumber: employee.phoneNumber,
      contractId: employee.contractId,
      departmentId: employee.departmentId,
    });
  }

  // Soumettre le formulaire pour mettre à jour l'employé
  onSubmit(): void {
    if (this.employeeForm.valid) {
        const updatedEmployee: Employee = {
            ...this.employeeForm.value,
            id: this.selectedEmployeeId,
        };

        console.log('Employee to update:', updatedEmployee); // Log pour vérifier les données

        this.employeeService.updateEmployee(this.selectedEmployeeId!, updatedEmployee).subscribe({
            next: () => {
                this.snackBar.open('Employee updated successfully!', 'Close', { duration: 3000 });
                this.router.navigate(['/admin/employees/edit-employee']);
            },
            error: (err) => {
                console.error('Error updating employee:', err);
                this.snackBar.open('Error updating employee', 'Close', { duration: 3000 });
            },
        });
    }
}
}
