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
    'employeeName',
    'employeeDepartment',
    'basicSalary',
    'bonuses',
    'deductions',
    'totalSalary',
    'payDate',
    'actions'
  ];

  dataSource = new MatTableDataSource<EmployeeSalary>([]);
  selection = new SelectionModel<EmployeeSalary>(true, []);

  // Propriété pour afficher le spinner de chargement
  isLoading: boolean = false;
  // Propriété pour gérer le décalage du contenu lorsque la sidebar est visible
  isSidebarVisible: boolean = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('filter') filter!: ElementRef;

  constructor(
    private salaryService: EmployeeSalaryService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.isLoading = true;
    this.salaryService.getAll().subscribe(
      (data) => {
        this.dataSource.data = data;
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.isLoading = false;
      },
      error => {
        console.error(error);
        this.isLoading = false;
      }
    );
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  openDialog(salary?: EmployeeSalary): void {
    const dialogRef = this.dialog.open(EmployeeSalaryFormComponent, {
      width: '600px',
      data: salary || null
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.load();
        this.snackBar.open('Saved successfully', '', { duration: 2000 });
      }
    });
  }

  delete(id: number): void {
    this.salaryService.delete(id).subscribe(() => {
      this.load();
      this.snackBar.open('Deleted successfully', '', { duration: 2000 });
    });
  }
}
