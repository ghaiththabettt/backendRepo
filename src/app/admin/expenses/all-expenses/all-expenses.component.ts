import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FormDialogComponent } from './dialog/form-dialog/form-dialog.component';
import { DeleteDialogComponent } from './dialog/delete/delete.component';
import { ExpenseService } from '../expense.service';
import { Expense, Employee } from '../expense.model';

@Component({
  selector: 'app-all-expenses',
  templateUrl: './all-expenses.component.html',
  styleUrls: ['./all-expenses.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatDialogModule,
    MatSnackBarModule,
    CurrencyPipe,
    DatePipe
  ]
})
export class AllExpensesComponent implements OnInit {
  displayedColumns: string[] = ['expenseId', 'employee', 'type', 'amount', 'date', 'status', 'actions'];
  dataSource: MatTableDataSource<Expense>;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private expenseService: ExpenseService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.dataSource = new MatTableDataSource<Expense>();
  }

  ngOnInit() {
    this.loadData();
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  addNew() {
    const dialogRef = this.dialog.open(FormDialogComponent, {
      data: { action: 'add' }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.expenseService.addExpense(result).subscribe({
          next: () => {
            this.loadData();
            this.showNotification('Expense added successfully');
          },
          error: (error) => {
            this.showNotification('Error adding expense');
            console.error(error);
          }
        });
      }
    });
  }

  editExpense(expense: Expense) {
    const dialogRef = this.dialog.open(FormDialogComponent, {
      data: { expense, action: 'edit' }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.expenseService.updateExpense(expense.expenseId, result).subscribe({
          next: () => {
            this.loadData();
            this.showNotification('Expense updated successfully');
          },
          error: (error) => {
            this.showNotification('Error updating expense');
            console.error(error);
          }
        });
      }
    });
  }

  deleteExpense(expense: Expense) {
    const dialogRef = this.dialog.open(DeleteDialogComponent, {
      data: expense
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.expenseService.deleteExpense(expense.expenseId).subscribe({
          next: () => {
            this.loadData();
            this.showNotification('Expense deleted successfully');
          },
          error: (error) => {
            this.showNotification('Error deleting expense');
            console.error(error);
          }
        });
      }
    });
  }

  getEmployeeFullName(employee: Employee): string {
    return employee ? `${employee.name} ${employee.lastName}` : '';
  }

  private loadData() {
    this.expenseService.getAllExpenses().subscribe({
      next: (data) => {
        this.dataSource.data = data;
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      },
      error: (error) => {
        this.showNotification('Error loading expenses');
        console.error(error);
      }
    });
  }

  private showNotification(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'right',
      verticalPosition: 'top'
    });
  }
}
