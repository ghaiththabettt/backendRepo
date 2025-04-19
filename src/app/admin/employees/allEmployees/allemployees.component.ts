import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { forkJoin, Subject } from 'rxjs';
import { formatDate, DatePipe, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Services et modèles
import { EmployeeService } from '../../../../services/employee.service';
import { DepartmentService } from '../../../../services/department.service';
import { ContractService } from '../../../../services/contract.service';
import { Employee } from '../../../../models/employee.model';
import { Contract } from '../../../../models/contract.model';
import { Department } from '../../../../models/department.model';

// On étend l'interface Employee pour ajouter la propriété fullName
interface EmployeeExtended extends Employee {
  fullName: string;
}

// Modules Angular Material et autres dépendances
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import {
  MatSnackBar,
  MatSnackBarHorizontalPosition,
  MatSnackBarVerticalPosition,
  MatSnackBarModule,
} from '@angular/material/snack-bar';
import { MatMenuTrigger, MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatRippleModule } from '@angular/material/core';

// Composants partagés
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';
import { FeatherIconsComponent } from '@shared/components/feather-icons/feather-icons.component';

// Modules d'animation et d'export
import { rowsAnimation } from '@shared';
import { TableExportUtil } from '@shared';

// Composants de dialogue
import { AllEmployeesFormComponent } from './dialogs/form-dialog/form-dialog.component';
import { AllEmployeesDeleteComponent } from './dialogs/delete/delete.component';

@Component({
  selector: 'app-allemployees',
  standalone: true,
  templateUrl: './allemployees.component.html',
  styleUrls: ['./allemployees.component.scss'],
  animations: [rowsAnimation],
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatIconModule,
    MatCheckboxModule,
    MatMenuModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatDialogModule,
    MatSelectModule,
    MatRippleModule,
    MatSnackBarModule,
    DatePipe,
    BreadcrumbComponent,
    FeatherIconsComponent,
  ],
})
export class AllemployeesComponent implements OnInit, OnDestroy {
  // Colonnes du tableau
  columnDefinitions = [
    { def: 'select',       label: 'Checkbox',     type: 'check',     visible: true },
    { def: 'fullName',     label: 'Name',         type: 'text',      visible: true },
    { def: 'dateOfBirth',  label: 'Birth Date',   type: 'date',      visible: true },
    { def: 'position',     label: 'Role',         type: 'text',      visible: true },
    { def: 'departmentId', label: 'Department',   type: 'text',      visible: true },
    { def: 'hireDate',     label: 'Joining Date', type: 'date',      visible: true },
    { def: 'email',        label: 'Email',        type: 'email',     visible: true },
    { def: 'contractId',   label: 'Contract',     type: 'text',      visible: true },
    { def: 'actions',      label: 'Actions',      type: 'actionBtn', visible: true },
  ];

  dataSource = new MatTableDataSource<EmployeeExtended>([]);
  selection = new SelectionModel<EmployeeExtended>(true, []);

  contracts: Contract[] = [];
  departments: Department[] = [];
  contextMenuPosition = { x: '0px', y: '0px' };
  isLoading = true;
  private destroy$ = new Subject<void>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('filter') filter!: ElementRef;
  @ViewChild(MatMenuTrigger) contextMenu?: MatMenuTrigger;

  constructor(
    private dialog: MatDialog,
    private employeesService: EmployeeService,
    private departmentService: DepartmentService,
    private contractService: ContractService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    // Charger en parallèle la liste des employés, départements, contrats
    forkJoin({
      employees: this.employeesService.getAllEmployees(),
      departments: this.departmentService.getAllDepartments(),
      contracts: this.contractService.getAllContracts(),
    }).subscribe({
      next: ({ employees, departments, contracts }) => {
        this.departments = departments;
        this.contracts = contracts;

        // On ajoute un "fullName" pour l'affichage
        this.dataSource.data = employees.map((emp) => ({
          ...emp,
          fullName: `${emp.lastName ?? ''} ${emp.name ?? ''}`.trim(),
        }));

        this.isLoading = false;
        this.refreshTable();

        // Filtre global (recherche)
        this.dataSource.filterPredicate = (emp: EmployeeExtended, filter: string) =>
          Object.values(emp).some((value) =>
            (value + '').toLowerCase().includes(filter)
          );
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
      },
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Bouton "+" => ouvrir formulaire en mode "add"
  public addNew(): void {
    this.openDialog('add');
  }

  // Bouton "refresh"
  public refresh(): void {
    this.ngOnInit();
  }

  // Retourne la liste des colonnes à afficher (selon "visible")
  getDisplayedColumns(): string[] {
    return this.columnDefinitions.filter(cd => cd.visible).map(cd => cd.def);
  }

  // Configure la pagination / le tri
  private refreshTable(): void {
    if (this.paginator) {
      this.paginator.pageIndex = 0;
      this.dataSource.paginator = this.paginator;
    }
    if (this.sort) {
      this.dataSource.sort = this.sort;
    }
  }

  // Filtre global
  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.dataSource.filter = filterValue;
  }

  // Ouvrir la dialog => "add" ou "edit"
  openDialog(action: 'add' | 'edit', row?: EmployeeExtended): void {
    const dialogRef = this.dialog.open(AllEmployeesFormComponent, {
      width: '60vw',
      data: {
        action,
        employee: row || null  // si "edit", on passe la ligne existante
      },
    });

    dialogRef.afterClosed().subscribe((result: Employee | undefined) => {
      if (!result) return; // si on a annulé

      if (action === 'add') {
        // Ajout
        this.dataSource.data.unshift({
          ...result,
          fullName: `${result.lastName ?? ''} ${result.name ?? ''}`.trim(),
        } as EmployeeExtended);
        this.dataSource._updateChangeSubscription();
        this.showNotification(
          'snackbar-success',
          'Add Record Successfully...!!!',
          'bottom',
          'center'
        );
      } else {
        // Edition
        // On remplace l'employé existant dans dataSource
        const index = this.dataSource.data.findIndex(e => e.id === result.id);
        if (index !== -1) {
          this.dataSource.data[index] = {
            ...result,
            fullName: `${result.lastName ?? ''} ${result.name ?? ''}`.trim(),
          } as EmployeeExtended;
          this.dataSource._updateChangeSubscription();
          this.showNotification(
            'snackbar-info',
            'Edit Record Successfully...!!!',
            'bottom',
            'center'
          );
        }
      }
    });
  }

  // Clic sur la ligne => on appelle openDialog('edit', row)
  public editCall(row: EmployeeExtended): void {
    this.openDialog('edit', row);
  }

  // Supprimer un employé (ouvre le dialog de confirmation)
  public deleteItem(row: EmployeeExtended): void {
    const dialogRef = this.dialog.open(AllEmployeesDeleteComponent, {
      data: {
        id: row.id,
        name: row.fullName,
        department: this.getDepartmentName(row.departmentId),
        // mobile: row.phone  // si vous voulez l'afficher
      },
    });

    dialogRef.afterClosed().subscribe((confirm) => {
      if (confirm) {
        // Si l'utilisateur a confirmé la suppression
        if (!row.id) return;
        this.employeesService.deleteEmployee(row.id).subscribe({
          next: () => {
            this.dataSource.data = this.dataSource.data.filter(
              (e) => e.id !== row.id
            );
            this.dataSource._updateChangeSubscription();
            this.showNotification(
              'snackbar-danger',
              'Delete Record Successfully...!!!',
              'bottom',
              'center'
            );
          },
          error: (err) => {
            console.error(err);
          },
        });
      }
    });
  }

  // Notification
  showNotification(
    colorName: string,
    text: string,
    placementFrom: MatSnackBarVerticalPosition,
    placementAlign: MatSnackBarHorizontalPosition
  ): void {
    this.snackBar.open(text, '', {
      duration: 2000,
      verticalPosition: placementFrom,
      horizontalPosition: placementAlign,
      panelClass: colorName,
    });
  }

  // Export Excel
  exportExcel(): void {
    const exportData = this.dataSource.filteredData.map(emp => ({
      FirstName: emp.name,
      LastName: emp.lastName,
      FullName: emp.fullName,
      Email: emp.email,
      BirthDate: emp.dateOfBirth
        ? formatDate(new Date(emp.dateOfBirth), 'yyyy-MM-dd', 'en')
        : '',
      Position: emp.position,
      HireDate: emp.hireDate
        ? formatDate(new Date(emp.hireDate), 'yyyy-MM-dd', 'en')
        : '',
      Department: this.getDepartmentName(emp.departmentId),
      Contract: this.getContractType(emp.contractId),
    }));
    TableExportUtil.exportToExcel(exportData, 'employee_data_export');
  }

  // Sélection multiple
  isAllSelected(): boolean {
    return this.selection.selected.length === this.dataSource.data.length;
  }

  masterToggle(): void {
    if (this.isAllSelected()) {
      this.selection.clear();
    } else {
      this.dataSource.data.forEach(row => this.selection.select(row));
    }
  }

  removeSelectedRows(): void {
    const totalSelect = this.selection.selected.length;
    this.dataSource.data = this.dataSource.data.filter(
      (item) => !this.selection.selected.includes(item)
    );
    this.selection.clear();
    this.showNotification(
      'snackbar-danger',
      `${totalSelect} Record(s) Deleted Successfully...!!!`,
      'bottom',
      'center'
    );
  }

  // Menu contextuel (clic droit)
  onContextMenu(event: MouseEvent, item: EmployeeExtended): void {
    event.preventDefault();
    this.contextMenuPosition = { x: `${event.clientX}px`, y: `${event.clientY}px` };
    if (this.contextMenu) {
      this.contextMenu.menuData = { item };
      this.contextMenu.menu?.focusFirstItem('mouse');
      this.contextMenu.openMenu();
    }
  }

  // Récupération du nom du département
  getDepartmentName(departmentId?: number): string {
    const dept = this.departments.find(d => d.departmentId === departmentId);
    return dept ? dept.departmentName || '' : '';
  }

  // Récupération du type de contrat
  getContractType(contractId?: number): string {
    const cont = this.contracts.find(c => c.contractId === contractId);
    return cont ? cont.contractType || '' : '';
  }
}
