import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { Trainers } from './trainers.model';
import { TrainersService } from './trainers.service';
import { TrainerssFormComponent } from './dialogs/form-dialog/form-dialog.component';
import { TrainersDeleteComponent } from './dialogs/delete/delete.component';
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';



@Component({
  selector: 'app-trainers',
  templateUrl: './trainers.component.html',
  styleUrls: ['./trainers.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatSnackBarModule,
    BreadcrumbComponent // ✅ important pour corriger 'app-breadcrumb'
  ]
})
export class TrainersComponent implements OnInit {
  dataSource = new MatTableDataSource<Trainers>([]);
  displayedColumns: string[] = ['topic', 'trainingType', 'startDate', 'endDate', 'actions'];
  isLoading = true;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('filter') filter!: ElementRef;

  breadscrums = [
    { title: 'Trainings', items: ['Training'], active: 'Trainings' }
  ];

  constructor(
    private trainersService: TrainersService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.trainersService.getTrainers().subscribe({
      next: (data) => {
        this.dataSource.data = data;
        this.isLoading = false;
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      },
      error: () => {
        this.isLoading = false;
        this.snackBar.open('Error loading trainings', '', { duration: 2000 });
      },
    });
  }

  applyFilter(event: Event): void {
    const value = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.dataSource.filter = value;
  }

  addNew(): void {
    const dialogRef = this.dialog.open(TrainerssFormComponent, {
      width: '600px',
      data: { action: 'add' },
    });

    dialogRef.afterClosed().subscribe((result: Trainers) => {
      if (result) {
        this.dataSource.data = [result, ...this.dataSource.data];
        this.snackBar.open('Training added successfully', '', { duration: 2000 });
      }
    });
  }

  editCall(training: Trainers): void {
    const dialogRef = this.dialog.open(TrainerssFormComponent, {
      width: '600px',
      data: { action: 'edit', trainers: training },
    });

    dialogRef.afterClosed().subscribe((result: Trainers) => {
      if (result) {
        const index = this.dataSource.data.findIndex(t => t.trainingId === result.trainingId);
        if (index !== -1) {
          this.dataSource.data[index] = result;
          this.dataSource._updateChangeSubscription();
        }
        this.snackBar.open('Training updated successfully', '', { duration: 2000 });
      }
    });
  }

  deleteItem(training: Trainers): void {
    const dialogRef = this.dialog.open(TrainersDeleteComponent, { data: training });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.trainersService.deleteTrainer(training.trainingId!).subscribe(() => {
          this.dataSource.data = this.dataSource.data.filter(t => t.trainingId !== training.trainingId);
          this.snackBar.open('Training deleted', '', { duration: 2000 });
        });
      }
    });
  }

  refresh(): void {
    this.loadData();
  }
}
