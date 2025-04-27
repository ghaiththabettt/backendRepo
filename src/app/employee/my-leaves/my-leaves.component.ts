// src/app/employee/my-leaves/my-leaves.component.ts
import { Component, ElementRef, OnDestroy, OnInit, ViewChild, Pipe, PipeTransform } from '@angular/core'; // Added Pipe, PipeTransform
import { HttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { MatMenuTrigger, MatMenuModule } from '@angular/material/menu';
import { SelectionModel } from '@angular/cdk/collections';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CommonModule, formatDate, NgClass, DatePipe, TitleCasePipe } from '@angular/common'; // Import necessary common modules/pipes

import { MyLeavesService } from './my-leaves.service';
import { MyLeaves } from './my-leaves.model';
import { MyLeavesFormComponent } from './dialogs/form-dialog/form-dialog.component';
import { MyLeavesDeleteComponent } from './dialogs/delete/delete.component';

import { rowsAnimation } from '@shared';
import { Direction } from '@angular/cdk/bidi';
import { TableExportUtil } from '@shared';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRippleModule } from '@angular/material/core';
import { FeatherIconsComponent } from '@shared/components/feather-icons/feather-icons.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';

// Custom pipe for formatting duration
@Pipe({
  name: 'formatDuration',
  standalone: true // Make pipe standalone
})
export class FormatDurationPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) return '';
    switch (value.toUpperCase()) {
      case 'FULL_DAY': return 'Full Day';
      case 'HALF_DAY': return 'Half Day';
      default:
        // Basic fallback formatting
        return value.replace(/_/g, ' ').replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase());
    }
  }
}


@Component({
    selector: 'app-my-leaves',
    templateUrl: './my-leaves.component.html',
    styleUrls: ['./my-leaves.component.scss'],
    animations: [rowsAnimation],
    standalone: true,
    imports: [
      CommonModule, // Provides common directives and pipes
      BreadcrumbComponent,
      FormsModule,
      MatTooltipModule,
      MatButtonModule,
      MatIconModule,
      MatTableModule,
      MatSortModule,
      MatCheckboxModule,
      FeatherIconsComponent,
      MatRippleModule,
      MatSelectModule,
      MatProgressSpinnerModule,
      MatMenuModule,
      MatPaginatorModule,
      FormatDurationPipe // Import the custom pipe
      // DatePipe and TitleCasePipe are available via CommonModule
    ],
    providers: [
      // Pipes provided by CommonModule don't usually need explicit provision here
      // If FormatDurationPipe wasn't standalone, provide it:
      // FormatDurationPipe
      // Provide DatePipe/TitleCasePipe if needed for injection (e.g., in exportExcel)
       DatePipe,
       TitleCasePipe,
       FormatDurationPipe // Provide custom pipe for injection if needed elsewhere
    ]
})
export class MyLeavesComponent implements OnInit, OnDestroy {
  // ** CORRECTED Column Definitions **
  columnDefinitions = [
    { def: 'select', label: 'Checkbox', type: 'check', visible: false },
    { def: 'id', label: 'ID', type: 'number', visible: false },
    { def: 'applyDate', label: 'Requested On', type: 'date', visible: true },
    { def: 'type', label: 'Leave Type', type: 'text', visible: true },
    { def: 'fromDate', label: 'From Date', type: 'date', visible: true },
    { def: 'toDate', label: 'To Date', type: 'date', visible: true },
    { def: 'durationType', label: 'Duration', type: 'text', visible: true }, // Changed from halfDay
    { def: 'reason', label: 'Reason', type: 'text', visible: true },
    { def: 'status', label: 'Status', type: 'text', visible: true },
    { def: 'actions', label: 'Actions', type: 'actionBtn', visible: true },
  ];

  dataSource = new MatTableDataSource<MyLeaves>([]);
  selection = new SelectionModel<MyLeaves>(true, []);
  contextMenuPosition = { x: '0px', y: '0px' };
  isLoading = true;
  private destroy$ = new Subject<void>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('filter', { static: true }) filter!: ElementRef;
  @ViewChild(MatMenuTrigger) contextMenu?: MatMenuTrigger;

  constructor(
    public dialog: MatDialog,
    public myLeavesService: MyLeavesService,
    private snackBar: MatSnackBar,
    // Inject pipes needed for methods like exportExcel
    private datePipe: DatePipe,
    private titleCasePipe: TitleCasePipe,
    private formatDurationPipe: FormatDurationPipe
  ) {}

  ngOnInit() {
    this.loadData();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  refresh() {
    this.loadData();
  }

  getDisplayedColumns(): string[] {
    return this.columnDefinitions
      .filter((cd) => cd.visible)
      .map((cd) => cd.def);
  }

  loadData() {
    this.isLoading = true;
    this.selection.clear();
    this.myLeavesService.getAllMyLeaves()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.dataSource.data = data;
          this.isLoading = false;
          this.refreshTable();
          this.dataSource.filterPredicate = (leaveData: MyLeaves, filter: string) => {
              // Include durationType in filter check
              const dataStr = (
                (leaveData.applyDate || '') +
                (leaveData.type || '') +
                (leaveData.fromDate || '') +
                (leaveData.toDate || '') +
                (leaveData.durationType || '') + // Add durationType
                (leaveData.reason || '') +
                (leaveData.status || '')
              ).toLowerCase();
              return dataStr.includes(filter);
          };
        },
        error: (err) => {
          console.error(err);
          this.isLoading = false;
          this.showNotification(
            'snackbar-danger',
            err.message || 'Failed to load your leave requests.',
            'bottom',
            'center'
          );
         }
      });
  }

  private refreshTable() {
    // Use setTimeout to ensure CD cycle completes and paginator/sort are ready
    setTimeout(() => {
      if (this.paginator && this.sort) {
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      } else {
          console.warn("Paginator or Sort not ready during refreshTable");
      }
    }, 0);
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.dataSource.filter = filterValue;
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  addNew() {
    this.openDialog('add');
  }

  editCall(row: MyLeaves) {
    if (row.status !== 'PENDING') {
      this.showNotification('snackbar-warning', 'Cannot edit requests that are not PENDING.', 'bottom', 'center');
      return;
    }
    this.openDialog('edit', row);
  }

  openDialog(action: 'add' | 'edit', data?: MyLeaves) {
    let varDirection: Direction = 'ltr';
    if (typeof localStorage !== 'undefined' && localStorage.getItem('isRtl') === 'true') {
      varDirection = 'rtl';
    }

    const dialogRef = this.dialog.open(MyLeavesFormComponent, {
      width: '60vw',
      maxWidth: '100vw',
      data: {
        myLeaves: data,
        action: action,
      },
      direction: varDirection,
      autoFocus: false,
    });

    dialogRef.afterClosed().subscribe((result: MyLeaves | undefined) => {
      if (result) {
        this.loadData(); // Reload data to show changes
        if (action === 'add') {
          this.showNotification('snackbar-success', 'Request Submitted Successfully!', 'bottom', 'center');
        } else if (action === 'edit') {
          this.showNotification('black', 'Request Updated Successfully!', 'bottom', 'center');
        }
      }
    });
  }

  deleteItem(row: MyLeaves) {
    if (row.status !== 'PENDING') {
      this.showNotification('snackbar-warning', 'Cannot cancel requests that are not PENDING.', 'bottom', 'center');
      return;
    }

    const dialogRef = this.dialog.open(MyLeavesDeleteComponent, {
      data: { // Pass necessary data for confirmation dialog
        id: row.id,
        type: row.type,
        status: row.status,
        reason: row.reason,
        fromDate: row.fromDate,
        toDate: row.toDate
      }
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.isLoading = true;
        this.myLeavesService.deleteMyLeaves(row.id, row.status)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.isLoading = false;
              this.loadData(); // Reload data after delete
              this.showNotification('snackbar-danger', 'Request Cancelled Successfully!', 'bottom', 'center'); // Changed message
            },
            error: (err) => {
              console.error("Cancel failed:", err);
              this.isLoading = false;
              this.showNotification('snackbar-danger', err.message || 'Failed to cancel request.', 'bottom', 'center');
            }
          });
      }
    });
  }

  showNotification(
    colorName: string,
    text: string,
    placementFrom: MatSnackBarVerticalPosition,
    placementAlign: MatSnackBarHorizontalPosition
  ) {
    this.snackBar.open(text, '', {
      duration: 3000,
      verticalPosition: placementFrom,
      horizontalPosition: placementAlign,
      panelClass: colorName,
    });
  }

  exportExcel() {
    const exportData = this.dataSource.filteredData.map((x) => ({
        // Use nullish coalescing operator (??) to provide '' if transform result is null
        'Requested On': this.datePipe.transform(x.applyDate, 'yyyy-MM-dd', 'en-US') ?? '',
        'Leave Type': (x.type ? this.titleCasePipe.transform(x.type) : '') ?? '', // Ensure non-null/undefined
        'From Date': this.datePipe.transform(x.fromDate, 'yyyy-MM-dd', 'en-US') ?? '',
        'To Date': this.datePipe.transform(x.toDate, 'yyyy-MM-dd', 'en-US') ?? '',
        'Duration': this.formatDurationPipe.transform(x.durationType) ?? '', // Ensure non-null/undefined
        'Reason': x.reason ?? '', // Ensure non-null/undefined
        'Status': (x.status ? this.titleCasePipe.transform(x.status) : '') ?? '', // Ensure non-null/undefined
      }));

    // Now exportData should conform to the expected type (no nulls)
    TableExportUtil.exportToExcel(exportData, 'my_leave_requests_export');
  }
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  masterToggle() {
    this.isAllSelected()
      ? this.selection.clear()
      : this.dataSource.data.forEach((row) => this.selection.select(row));
  }

  onContextMenu(event: MouseEvent, item: MyLeaves) {
    event.preventDefault();
    this.contextMenuPosition = {
      x: `${event.clientX}px`,
      y: `${event.clientY}px`,
    };
    if (this.contextMenu) {
      this.contextMenu.menuData = { item };
      this.contextMenu.menu?.focusFirstItem('mouse');
      this.contextMenu.openMenu();
    }
  }
}