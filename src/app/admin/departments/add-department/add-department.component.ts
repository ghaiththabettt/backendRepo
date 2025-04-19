import { Component } from '@angular/core';
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';
import { Department } from '../all-departments/department.model';
import { DepartmentService } from 'app/admin/departments/all-departments/department.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-add-department',
  templateUrl: './add-department.component.html',
  styleUrls: ['./add-department.component.scss'],
  standalone: true,
  imports: [
    BreadcrumbComponent,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    CommonModule
  ]
})
export class AddDepartmentComponent {
  departmentForm: UntypedFormGroup;
  department!: Department;
  breadscrums = [
    {
      title: 'Add Department',
      items: ['Department'],
      active: 'Add',
    },
  ];

  constructor(
    private fb: UntypedFormBuilder,
    private departmentService: DepartmentService
  ) {
    // Initialisation du modèle avec des valeurs par défaut
    this.department = {
      departmentName: '',
      phone: '',
      emailDept: ''
    };

    // Création du formulaire réactif avec les champs correspondant au backend
    this.departmentForm = this.fb.group({
      departmentName: [this.department.departmentName, [Validators.required]],
      phone: [this.department.phone, [Validators.required]],
      emailDept: [this.department.emailDept, [Validators.required, Validators.email]]
    });
  }

  onSubmit(): void {
    if (this.departmentForm.valid) {
      // Appel au service pour créer le département
      this.departmentService.createDepartment(this.departmentForm.value).subscribe(
        (result) => {
          console.log('Department added successfully:', result);
          // Réinitialisation du formulaire ou navigation vers une autre page si nécessaire
          this.departmentForm.reset();
        },
        (error) => {
          console.error('Error adding department:', error);
        }
      );
    }
  }
}
