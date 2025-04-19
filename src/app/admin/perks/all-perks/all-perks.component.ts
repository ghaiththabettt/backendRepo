import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RouterModule } from '@angular/router';
import { PerksService } from '../perks.service';
import { Perks } from '../perks.model';
import { UnsubscribeOnDestroyAdapter } from '@shared';
import { Direction } from '@angular/cdk/bidi';

@Component({
  selector: 'app-all-perks',
  templateUrl: './all-perks.component.html',
  styleUrls: ['./all-perks.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    RouterModule
  ]
})
export class AllPerksComponent extends UnsubscribeOnDestroyAdapter implements OnInit {
  displayedColumns = ['perksId', 'employeeId', 'perksType', 'datePerks', 'reason', 'actions'];
  dataSource: Perks[] = [];

  constructor(
    public dialog: MatDialog,
    public perksService: PerksService,
    private snackBar: MatSnackBar
  ) {
    super();
  }

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.perksService.getAllPerks().subscribe({
      next: (data) => {
        this.dataSource = data;
      },
      error: (error) => {
        this.showNotification('error', 'Error loading perks data');
      }
    });
  }

  deletePerks(id: number) {
    this.perksService.deletePerks(id).subscribe({
      next: () => {
        this.loadData();
        this.showNotification('success', 'Perks deleted successfully');
      },
      error: (error) => {
        this.showNotification('error', 'Error deleting perks');
      }
    });
  }

  private showNotification(type: string, message: string) {
    this.snackBar.open(message, '', {
      duration: 2000,
      verticalPosition: 'top',
      horizontalPosition: 'right',
      panelClass: type === 'success' ? ['success-snackbar'] : ['error-snackbar']
    });
  }
}
