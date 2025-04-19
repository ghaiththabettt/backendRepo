import { Component, OnInit, ViewChild } from '@angular/core';
import { TrainingListService } from './training-list.service';
import { CommonModule } from '@angular/common';
import { NgIf, NgFor } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface TrainingDTO {
  trainingId: number;
  trainingName: string;
  trainingType: string;
  location: string;
  startDate: string;
  endDate: string;
}
interface TrainerInfo {
  name: string;
  lastName: string;
  email: string;
  departmentName: string;
  trainingName: string;
  trainingType: string;
  location: string;
  startDate: string;
  endDate: string;
}

@Component({
  selector: 'app-training-list',
  standalone: true,
  imports: [
    CommonModule,
    NgIf,
    NgFor,
    HttpClientModule,
    MatTableModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule
  ],
  templateUrl: './training-list.component.html',
  styleUrls: ['./training-list.component.scss']
})
export class TrainingListComponent implements OnInit {
  displayedColumns: string[] = ['name', 'email', 'department', 'training', 'dates', 'location', 'actions'];
  dataSource = new MatTableDataSource<TrainerInfo>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private trainingListService: TrainingListService) {}

  ngOnInit(): void {
    this.fetchAllTrainersWithTrainings();
  }

  fetchAllTrainersWithTrainings(): void {
    this.trainingListService.getAllTrainersWithTrainings().subscribe({
      next: (data) => {
        this.dataSource.data = data;
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      },
      error: (err) => console.error('Erreur chargement des formateurs :', err)
    });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  exportToExcel(): void {
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.dataSource.data);
    const workbook: XLSX.WorkBook = {
      Sheets: { 'Participants': worksheet },
      SheetNames: ['Participants']
    };
    XLSX.writeFile(workbook, 'participants.xlsx');
  }

  exportToPDF(): void {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [['Name', 'Email', 'Department', 'Training', 'Dates', 'Location']],
      body: this.dataSource.data.map(t => [
        `${t.name} ${t.lastName}`,
        t.email,
        t.departmentName,
        `${t.trainingName} (${t.trainingType})`,
        `${t.startDate} - ${t.endDate}`,
        t.location
      ])
    });
    doc.save('participants.pdf');
  }

  editTrainer(trainer: TrainerInfo): void {
    console.log('Edit trainer:', trainer);
    // Ouvrir un dialog de modification ou rediriger vers une page
  }

  removeTrainerFromTraining(trainer: TrainerInfo): void {
    console.log('Remove trainer from training:', trainer);
    // Appeler un service backend pour retirer le formateur de la formation
  }
}
