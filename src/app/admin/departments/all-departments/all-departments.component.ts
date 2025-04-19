import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Department } from './department.model'; // Mettez à jour le chemin selon votre projet
import { DepartmentService } from './department.service'; // Mettez à jour le chemin selon votre projet
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';
import { TrainingService } from './training.service';
import { EmployeeService } from './employee.service';
import { PolicyService } from './policy.service';
// Import des composants de dialogue
import { TrainingListDialogComponent } from 'app/admin/departments/all-departments/dialogs/form-dialog/employees-list-dialog/training-list-dialog.component';
import { EmployeesListDialogComponent } from 'app/admin/departments/all-departments/dialogs/form-dialog/employees-list-dialog/employees-list-dialog.component';
import { PoliciesListDialogComponent } from 'app/admin/departments/all-departments/dialogs/form-dialog/employees-list-dialog/policies-list-dialog.component';

@Component({
  selector: 'app-all-departments',
  standalone: true,
  templateUrl: './all-departments.component.html',
  styleUrls: ['./all-departments.component.scss'],
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    MatTooltipModule,
    BreadcrumbComponent
  ]
})
export class AllDepartmentsComponent implements OnInit {
  displayedColumns: string[] = ['departmentName', 'phone', 'emailDept', 'totalEmployees', 'actions'];
  dataSource = new MatTableDataSource<Department>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  isSidebarVisible: boolean = false;

  constructor(
    private departmentService: DepartmentService,
    private trainingService: TrainingService,
    private employeeService: EmployeeService,
    private policyService: PolicyService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadDepartments();
  }

  loadDepartments(): void {
    this.departmentService.getAllDepartments().subscribe({
      next: (departments) => {
        this.dataSource.data = departments;
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      },
      error: (err) => console.error('Error fetching departments:', err)
    });
  }

  viewTrainings(dept: Department): void {
    if (!dept.departmentId) { return; }
    this.trainingService.getTrainingsByDepartmentId(dept.departmentId).subscribe({
      next: (trainings) => {
        this.dialog.open(TrainingListDialogComponent, {
          data: { department: dept, trainings }
        });
      },
      error: (error) => console.error('Error fetching trainings:', error)
    });
  }

  viewEmployees(dept: Department): void {
    if (!dept.departmentId) { return; }
    this.employeeService.getEmployeesByDepartmentId(dept.departmentId).subscribe({
      next: (employees) => {
        this.dialog.open(EmployeesListDialogComponent, {
          data: { department: dept, employees }
        });
      },
      error: (error) => console.error('Error fetching employees:', error)
    });
  }

  viewPolicies(dept: Department): void {
    if (!dept.departmentId) { return; }
    this.policyService.getPoliciesByDepartmentId(dept.departmentId).subscribe({
      next: (policies) => {
        this.dialog.open(PoliciesListDialogComponent, {
          data: { department: dept, policies }
        });
      },
      error: (error) => console.error('Error fetching policies:', error)
    });
  }
}
