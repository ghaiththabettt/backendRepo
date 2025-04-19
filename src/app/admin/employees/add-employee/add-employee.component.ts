import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';

import { AuthService } from 'app/core/service/auth.service';
import { DepartmentService } from 'services/department.service';
import { ContractService } from 'services/contract.service';
import { Employee } from '../../../../models/employee.model';

@Component({
  selector: 'app-add-employee',
  standalone: true,
  templateUrl: './add-employee.component.html',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatOptionModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatSnackBarModule,
    MatCardModule
  ],
})
export class AddEmployeeComponent implements OnInit {
  employeeForm!: FormGroup;
  departments: any[] = [];
  contracts: any[] = [];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private departmentService: DepartmentService,
    private contractService: ContractService
  ) {}

  ngOnInit(): void {
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
      departmentId: [null, Validators.required]
    });

    this.loadDepartments();
    this.loadContracts();
  }

  loadDepartments(): void {
    this.departmentService.getAllDepartments().subscribe({
      next: (data) => this.departments = data,
      error: (err) => console.error('Erreur lors du chargement des départements', err)
    });
  }

  loadContracts(): void {
    this.contractService.getAllContracts().subscribe({
      next: (data) => this.contracts = data,
      error: (err) => console.error('Erreur lors du chargement des contrats', err)
    });
  }

  onSubmit(): void {
    if (this.employeeForm.valid) {
      const newEmployee: Employee = {
        ...this.employeeForm.value,
        userType: 'ROLE_EMPLOYEE'
      };

      this.authService.registerEmployee(newEmployee).subscribe({
        next: () => {
          this.snackBar.open('Employé ajouté avec succès !', 'Fermer', { duration: 3000 });
          this.employeeForm.reset();
        },
        error: (err) => {
          console.error('Erreur lors de l’ajout:', err);
          this.snackBar.open('Erreur lors de l’ajout', 'Fermer', { duration: 3000 });
        }
      });
    }
  }
}
