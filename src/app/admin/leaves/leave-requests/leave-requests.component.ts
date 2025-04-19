import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { LeavesService } from './leaves.service';
import { HttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { Leaves } from './leaves.model';
import {
  MatSnackBar,
  MatSnackBarHorizontalPosition,
  MatSnackBarVerticalPosition,
} from '@angular/material/snack-bar';
import { MatMenuTrigger, MatMenuModule } from '@angular/material/menu';
import { Subject, takeUntil } from 'rxjs'; // Import takeUntil
import { LeaveRequestFormComponent } from './form/form.component';
import { LeaveRequestDeleteComponent } from './delete/delete.component';
import { SelectionModel } from '@angular/cdk/collections';
import { rowsAnimation } from '@shared';
import { Direction } from '@angular/cdk/bidi';
import { TableExportUtil } from '@shared';
import { formatDate, NgClass, DatePipe } from '@angular/common';
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

@Component({
    selector: 'app-leave-requests',
    templateUrl: './leave-requests.component.html',
    styleUrls: ['./leave-requests.component.scss'],
    animations: [rowsAnimation],
    standalone: true, // Make it standalone
    imports: [
        BreadcrumbComponent,
        FormsModule,
        MatTooltipModule,
        MatButtonModule,
        MatIconModule,
        MatTableModule,
        MatSortModule,
        NgClass,
        MatCheckboxModule,
        FeatherIconsComponent,
        MatRippleModule,
        MatSelectModule,
        MatProgressSpinnerModule,
        MatMenuModule,
        MatPaginatorModule,
        DatePipe,
        // Needed standalone components:
        // LeaveRequestFormComponent, // Imported dynamically via Dialog
        // LeaveRequestDeleteComponent, // Imported dynamically via Dialog
    ]
})
export class LeaveRequestsComponent implements OnInit, OnDestroy {
  // Column definitions might need slight label adjustments if backend names differ
  columnDefinitions = [
    { def: 'select', label: 'Checkbox', type: 'check', visible: true },
    { def: 'id', label: 'ID', type: 'number', visible: false }, // Keep frontend ID mapping
    { def: 'name', label: 'Employee Name', type: 'text', visible: true }, // From Backend DTO employeeName
    { def: 'employeeId', label: 'Employee ID', type: 'text', visible: true }, // From Backend DTO employeeId (or hide if name is enough)
    { def: 'department', label: 'Department', type: 'text', visible: true }, // From Backend DTO departmentName
    { def: 'type', label: 'Leave Type', type: 'text', visible: true }, // From Backend DTO leaveType
    { def: 'from', label: 'Leave From', type: 'date', visible: true }, // From Backend DTO startDate
    { def: 'leaveTo', label: 'Leave To', type: 'date', visible: true }, // From Backend DTO endDate
    { def: 'noOfDays', label: 'Days', type: 'text', visible: true }, // From Backend DTO numberOfDays
    { def: 'durationType', label: 'Duration', type: 'text', visible: true }, // From Backend DTO durationType
    { def: 'status', label: 'Status', type: 'text', visible: true }, // From Backend DTO statusLeave
    { def: 'reason', label: 'Reason', type: 'text', visible: false }, // Keep hidden by default
    { def: 'note', label: 'Note', type: 'text', visible: false }, // Keep hidden by default
    { def: 'requestedOn', label: 'Requested On', type: 'date', visible: true }, // From Backend DTO requestedOn
    { def: 'approvedBy', label: 'Approved By', type: 'text', visible: true }, // From Backend DTO approvedByName
    { def: 'approvalDate', label: 'Approval Date', type: 'date', visible: true }, // From Backend DTO approvalDate
    { def: 'actions', label: 'Actions', type: 'actionBtn', visible: true },
  ];

  dataSource = new MatTableDataSource<Leaves>([]);
  selection = new SelectionModel<Leaves>(true, []);
  contextMenuPosition = { x: '0px', y: '0px' };
  isLoading = true;
  private destroy$ = new Subject<void>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('filter') filter!: ElementRef;
  @ViewChild(MatMenuTrigger) contextMenu?: MatMenuTrigger;

  constructor(
    // public httpClient: HttpClient, // Not directly needed if service handles all
    public dialog: MatDialog,
    public leavesService: LeavesService,
    private snackBar: MatSnackBar
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
    this.leavesService.getAllLeaves()
    .pipe(takeUntil(this.destroy$)) // Unsubscribe automatically
    .subscribe({
      next: (data) => {
        this.dataSource.data = data;
        this.isLoading = false;
        this.refreshTable();
        // Optional: Define a more specific filter predicate if needed
        this.dataSource.filterPredicate = (leaveData: Leaves, filter: string) => {
            const dataStr = JSON.stringify(leaveData).toLowerCase();
            return dataStr.includes(filter);
        };
      },
      error: (err) => {
          console.error(err);
          this.isLoading = false;
          this.showNotification(
              'snackbar-danger',
              'Failed to load leave requests.',
              'bottom',
              'center'
            );
      },
    });
  }

  private refreshTable() {
    // Ensure paginator and sort are initialized before assigning
    if (this.paginator && this.sort) {
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        // Go to first page if not already there
        // this.paginator.firstPage(); // Uncomment if needed
    } else {
      // Use setTimeout to wait for view initialization if needed
      setTimeout(() => {
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      });
    }
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value
      .trim()
      .toLowerCase();
    this.dataSource.filter = filterValue;
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  addNew() {
    this.openDialog('add');
  }

  editCall(row: Leaves) {
    // Ensure you have employeeId before editing if needed by the form
    // The form currently uses leaves.employeeId which should be populated
    if (!row.employeeId) {
        console.warn("Employee ID missing for leave:", row.id);
        // Potentially fetch full details if needed, or rely on existing data
    }
    this.openDialog('edit', row);
  }

  detailsCall(row: Leaves) {
    // 'details' action in the form component handles displaying data
    // It might also trigger approve/reject actions
    this.dialog.open(LeaveRequestFormComponent, {
      data: {
        leaves: row, // Pass the frontend model data
        action: 'details',
      },
      width: '60vw',
      maxWidth: '100vw',
      autoFocus: false,
    });
    // Note: Details view might need to refresh data if approve/reject happens
    // Consider handling dialog close result here if details actions modify data
  }

  openDialog(action: 'add' | 'edit', data?: Leaves) {
    let varDirection: Direction = 'ltr'; // Default LTR
    if (typeof localStorage !== 'undefined' && localStorage.getItem('isRtl') === 'true') {
      varDirection = 'rtl';
    }
    const dialogRef = this.dialog.open(LeaveRequestFormComponent, {
      width: '60vw',
      maxWidth: '100vw',
      data: {
        leaves: data, // Pass existing data for edit
        action: action,
      },
      direction: varDirection,
      autoFocus: false,
    });

    dialogRef.afterClosed().subscribe((result: Leaves | undefined) => { // Expecting the updated/added Leaves object
      if (result) { // Check if data was returned (save successful)
        if (action === 'add') {
          // Add to top and refresh
          this.dataSource.data = [result, ...this.dataSource.data];
          this.showNotification('snackbar-success', 'Record Added Successfully!', 'bottom', 'center');
        } else if (action === 'edit') {
          // Find and update the record
          this.updateRecord(result);
          this.showNotification('black', 'Record Updated Successfully!', 'bottom', 'center');
        }
        this.refreshTable(); // Refresh sorting/pagination
      }
      // No else needed if cancel returns nothing
    });
  }

  private updateRecord(updatedRecord: Leaves) {
    const index = this.dataSource.data.findIndex(
      (record) => record.id === updatedRecord.id
    );
    if (index !== -1) {
      // Replace the item to trigger change detection
      const updatedData = [...this.dataSource.data];
      updatedData[index] = updatedRecord;
      this.dataSource.data = updatedData;
      // No need for this.dataSource._updateChangeSubscription(); with data reassignment
    }
  }

  deleteItem(row: Leaves) {
    const dialogRef = this.dialog.open(LeaveRequestDeleteComponent, {
      data: row, // Pass necessary data for confirmation display
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => { // Expecting boolean confirmation
      if (confirmed) {
        this.isLoading = true; // Show spinner during deletion
        this.leavesService.deleteLeaves(row.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
            next: (deletedId) => {
              // Remove from datasource ONLY after successful backend deletion
              this.dataSource.data = this.dataSource.data.filter(
                (record) => record.id !== deletedId
              );
              this.isLoading = false;
              this.selection.deselect(row); // Deselect if it was selected
              this.refreshTable();
              this.showNotification('snackbar-danger', 'Record Deleted Successfully!', 'bottom', 'center');
            },
            error: (err) => {
                console.error("Delete failed:", err);
                this.isLoading = false;
                this.showNotification('snackbar-danger', 'Failed to delete record.', 'bottom', 'center');
            }
        });
      }
    });
  }

  // Bulk delete (assuming backend supports it, otherwise loop deleteItem)
  removeSelectedRows() {
    const totalSelect = this.selection.selected.length;
    if (totalSelect === 0) return;

    // Option 1: Loop and call deleteItem (simpler, multiple API calls)
    // Option 2: Implement a bulk delete endpoint in backend and service

    // Using Option 1 for simplicity:
    const rowsToDelete = [...this.selection.selected]; // Copy selection
    let successCount = 0;
    let failCount = 0;
    this.isLoading = true;

    rowsToDelete.forEach((row, index) => {
        this.leavesService.deleteLeaves(row.id)
          .pipe(takeUntil(this.destroy$)) // Manage unsubscription
          .subscribe({
            next: (deletedId) => {
              successCount++;
              this.dataSource.data = this.dataSource.data.filter(
                (record) => record.id !== deletedId
              );
              this.selection.deselect(row); // Deselect the successfully deleted row
              if (index === rowsToDelete.length - 1) { // Last iteration
                  this.finalizeBulkDelete(successCount, failCount, totalSelect);
              }
            },
            error: (err) => {
              failCount++;
              console.error(`Failed to delete leave ${row.id}:`, err);
              this.selection.deselect(row); // Deselect the failed row as well
              if (index === rowsToDelete.length - 1) { // Last iteration
                  this.finalizeBulkDelete(successCount, failCount, totalSelect);
              }
            }
        });
    });
  }

  private finalizeBulkDelete(successCount: number, failCount: number, totalSelect: number) {
      this.isLoading = false;
      this.refreshTable();
      if (failCount === 0) {
          this.showNotification('snackbar-danger', `${successCount} Record(s) Deleted Successfully!`, 'bottom', 'center');
      } else {
          this.showNotification('snackbar-warning', `Deleted ${successCount} of ${totalSelect}. Failed: ${failCount}.`, 'bottom', 'center');
      }
      this.selection.clear(); // Clear selection completely after operation
  }


  showNotification(
    colorName: string,
    text: string,
    placementFrom: MatSnackBarVerticalPosition,
    placementAlign: MatSnackBarHorizontalPosition
  ) {
    this.snackBar.open(text, '', {
      duration: 3000, // Increased duration
      verticalPosition: placementFrom,
      horizontalPosition: placementAlign,
      panelClass: colorName,
    });
  }

  // Export logic remains similar, ensure dates are formatted correctly
  exportExcel() {
    const exportData = this.dataSource.filteredData.map((x) => ({
        'ID': x.id,
        'Employee Name': x.name,
        'Employee ID': x.employeeId, // Make sure this exists if needed
        'Department': x.department,
        'Leave Type': x.type,
        'Leave From': x.from ? formatDate(x.from, 'yyyy-MM-dd', 'en') : '',
        'Leave To': x.leaveTo ? formatDate(x.leaveTo, 'yyyy-MM-dd', 'en') : '',
        'Number of Days': x.noOfDays,
        'Duration Type': x.durationType,
        'Status': x.status,
        'Reason': x.reason,
        'Note': x.note,
        'Requested On': x.requestedOn ? formatDate(x.requestedOn, 'yyyy-MM-dd', 'en') : '',
        'Approved By': x.approvedBy || '',
        'Approval Date': x.approvalDate ? formatDate(x.approvalDate, 'yyyy-MM-dd', 'en') : '',
      }));

    TableExportUtil.exportToExcel(exportData, 'leave_requests_export');
  }

  // --- Selection Methods ---
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

  // --- Context Menu ---
  onContextMenu(event: MouseEvent, item: Leaves) {
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