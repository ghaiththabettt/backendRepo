import { Component, OnInit } from '@angular/core';
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { DepartmentService } from 'app/admin/departments/all-departments/department.service';
import { PolicyService } from 'app/admin/departments/all-departments/policy.service';
import { TrainingService } from 'app/admin/departments/all-departments/training.service';
import { Department } from 'app/admin/departments/all-departments/department.model';
import { Policy } from 'app/admin/departments/all-departments/department.model';
import { Training } from 'app/admin/departments/all-departments/department.model';

// Ajoutez cet import pour le composant Breadcrumb
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component'; 

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-edit-department',
  templateUrl: './edit-department.component.html',
  styleUrls: ['./edit-department.component.scss'],
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    BreadcrumbComponent,
  ],
})
export class EditDepartmentComponent implements OnInit {
  departmentForm: UntypedFormGroup;
  departments: Department[] = [];  // Liste des départements
  department!: Department;
  policies: Policy[] = [];
  trainings: Training[] = [];

  breadscrums = [
    {
      title: 'Edit Department',
      items: ['Department'],
      active: 'Edit',
    },
  ];

  constructor(
    private fb: UntypedFormBuilder,
    private departmentService: DepartmentService,
    private policyService: PolicyService,
    private trainingService: TrainingService
  ) {
    this.departmentForm = this.fb.group({});
  }

  ngOnInit(): void {
    this.loadDepartments(); // Charger la liste des départements
  }

  private loadDepartments() {
    this.departmentService.getAllDepartments().subscribe((departments) => {
      this.departments = departments;
    });
  }

  onDepartmentChange(departmentId: number) {
    this.departmentService.getDepartmentById(departmentId).subscribe((data) => {
      this.department = data;
      this.initializeForm();
    });

    this.loadPolicies(departmentId);
    this.loadTrainings(departmentId);
  }

  private initializeForm() {
    this.departmentForm = this.fb.group({
      departmentId: [this.department.departmentId],
      departmentName: [this.department.departmentName, [Validators.required]],
      phone: [this.department.phone, [Validators.required]],
      emailDept: [this.department.emailDept, [Validators.required, Validators.email]],
      employeeIds: [this.department.employeeIds || []],
      trainingIds: [this.department.trainingIds || []],
      policyIds: [this.department.policyIds || []],
    });
  }

  private loadPolicies(departmentId: number) {
    this.policyService.getPoliciesByDepartmentId(departmentId).subscribe((policies) => {
      this.policies = policies;
    });
  }

  private loadTrainings(departmentId: number) {
    this.trainingService.getTrainingsByDepartmentId(departmentId).subscribe((trainings) => {
      this.trainings = trainings;
    });
  }

  onSubmit(): void {
    if (this.departmentForm.valid) {
      const formValue = this.departmentForm.value;
      this.departmentService.updateDepartment(formValue.departmentId, formValue).subscribe(
        (result) => {
          console.log('Department updated successfully:', result);
        },
        (error) => {
          console.error('Error updating department:', error);
        }
      );
    }
  }
}
