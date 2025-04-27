import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
// Suppression des imports non utilisés pour CommonModule, NgIf, etc. car gérés par standalone imports
// import { CommonModule, NgIf, NgFor, NgClass } from '@angular/common'; // Plus nécessaire ici
// import { RouterLink, RouterModule } from '@angular/router'; // Non utilisé ici
import { FormsModule } from '@angular/forms'; // Gardé car utilisé pour [(ngModel)]
// Import des modules Material utilisés DANS LE TEMPLATE (gérés par standalone imports)
/*
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { NgScrollbar } from 'ngx-scrollbar';
*/
import { ChartComponent, NgApexchartsModule, ApexAxisChartSeries, ApexChart, ApexDataLabels, ApexStroke, ApexTitleSubtitle, ApexXAxis, ApexYAxis, ApexGrid, ApexTooltip, ApexLegend, ApexFill, ApexResponsive, ApexNonAxisChartSeries, ApexMarkers, ApexPlotOptions } from 'ng-apexcharts';
import { Subject, forkJoin, of } from 'rxjs';
import { takeUntil, map, catchError } from 'rxjs/operators';

// Services
import { EmployeeService } from '../../../../services/employee.service'; // VÉRIFIER CHEMIN
import { DepartmentService } from '../../../../services/department.service'; // VÉRIFIER CHEMIN
import { LeavesService } from '../../leaves/leave-requests/leaves.service'; // VÉRIFIER CHEMIN
import { EntreeDeTempsService } from '../../../services/entree-de-temps.service'; // VÉRIFIER CHEMIN
// import { ExpenseService } from '../../expenses/expense.service'; // Non utilisé apparemment
// import { JobPositionService } from '../../../../services/JobPosition.service'; // Non utilisé apparemment

// Models
import { Employee } from '../../../../models/employee.model'; // VÉRIFIER CHEMIN & PROPRIETES
import { Department } from '../../../../models/department.model'; // VÉRIFIER CHEMIN & PROPRIETES
import { Leaves } from '../../leaves/leave-requests/leaves.model'; // VÉRIFIER CHEMIN & PROPRIETES
import { EntreeDeTempsDTO } from '../../../models/entree-de-temps.dto'; // VÉRIFIER CHEMIN & PROPRIETES
// import { Expense } from '../../expenses/expense.model'; // Non utilisé apparemment
// import { JobPosition } from '../../../../models/JobPosition.model'; // Non utilisé apparemment

// Components (uniquement ceux utilisés dans le template HTML corrigé)
import { BreadcrumbComponent } from '../../../shared/components/breadcrumb/breadcrumb.component';
import { InfoBox1Component } from '../../../shared/components/info-box1/info-box1.component';
// SUPPRESSION des imports pour RecentComments, ProgressTable, EarningSource, TableCard
import { CommonModule } from '@angular/common';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';


// ApexCharts types et ChartOptions (inchangés)
export type ChartOptions = {
    series?: ApexAxisChartSeries | ApexNonAxisChartSeries; chart?: ApexChart; xaxis?: ApexXAxis; stroke?: ApexStroke; dataLabels?: ApexDataLabels; markers?: ApexMarkers; colors?: string[]; yaxis?: ApexYAxis | ApexYAxis[]; grid?: ApexGrid; legend?: ApexLegend; tooltip?: ApexTooltip; fill?: ApexFill; title?: ApexTitleSubtitle; responsive?: ApexResponsive[]; labels?: string[]; plotOptions?: ApexPlotOptions;
};

@Component({
  selector: 'app-dashboard2',
  templateUrl: './dashboard2.component.html', // Pointe vers le HTML nettoyé ci-dessous
  styleUrls: ['./dashboard2.component.scss'],
  standalone: true,
  imports: [
    // Imports nécessaires pour le template NETTOYÉ
    CommonModule, // Pour *ngIf, *ngFor
    FormsModule, // Pour [(ngModel)] sur mat-button-toggle-group
    BreadcrumbComponent,
    NgApexchartsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    InfoBox1Component,
    MatProgressSpinnerModule,
    MatButtonToggleModule,
    // SUPPRESSION des imports pour RecentComments, ProgressTable, EarningSource, TableCard, Scrollbar, ProgressBar, Tooltip, Menu
  ],
  providers: [
     // Garder seulement les services injectés dans le constructeur
     EmployeeService,
     DepartmentService,
     LeavesService,
     EntreeDeTempsService,
    // ExpenseService, // Non injecté
    // JobPositionService // Non injecté
  ]
})
export class Dashboard2Component implements OnInit, OnDestroy {
  // Garder seulement les ViewChild utilisés
  @ViewChild('timeEntryChart') timeEntryChart!: ChartComponent;
  // @ViewChild('leaveChart') leaveChart!: ChartComponent; // Pas utilisé pour updateOptions
  // @ViewChild('jobPositionChart') jobPositionChart!: ChartComponent; // Pas utilisé pour updateOptions
  // @ViewChild('departmentChart') departmentChart!: ChartComponent; // Pas utilisé pour updateOptions

  // Propriétés NETTOYÉES
  title = 'Tableau de Bord'; // Titre simple

  // Options pour les graphiques
  public timeEntryChartOptions!: Partial<ChartOptions>;
  public leaveTypePieOptions!: Partial<ChartOptions>;
  public departmentPieOptions!: Partial<ChartOptions>;
  public jobPositionPieOptions!: Partial<ChartOptions>;

  // Booléens pour affichage
  showTimeEntryChart = false;
  showLeaveTypePie = false;
  showDepartmentPie = false;
  showJobPositionPie = false; // Renommer pour correspondre

  // Statistiques pour les cartes InfoBox (calculées)
  totalEmployees = 0;
  totalDepartments = 0;
  totalPendingLeaves = 0;
  totalTimeEntriesHours = 0;

  // Données brutes (nécessaires)
  private allTimeEntries: EntreeDeTempsDTO[] = [];
  private allLeaves: Leaves[] = [];
  private allEmployees: Employee[] = [];
  private allDepartments: Department[] = [];
  // private jobPositions: JobPosition[] = []; // Décommenter si JobPositionService est utilisé

  // Filtre de temps
  selectedTimeFilter: 'day' | 'week' | 'month' | 'year' = 'week';

  isLoading = true;
  errorMessage: string | null = null;
  private destroy$ = new Subject<void>();

  // Injecter seulement les services utilisés
  constructor(
    private employeeService: EmployeeService,
    private departmentService: DepartmentService,
    private leavesService: LeavesService,
    private entreeDeTempsService: EntreeDeTempsService,
    // private jobPositionService: JobPositionService // Décommenter si utilisé
  ) {}

  ngOnInit() {
    this.initializeChartOptions();
    this.loadDashboardData();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initializeChartOptions() {
    this.timeEntryChartOptions = this.getInitialBarChartOptions('Heures Travaillées par Période', 'Heures');
    this.leaveTypePieOptions = this.getInitialPieChartOptions('Répartition des Types de Congés');
    this.departmentPieOptions = this.getInitialPieChartOptions('Répartition par Département');
    this.jobPositionPieOptions = this.getInitialPieChartOptions('Répartition par Poste'); // Utilise cette option
  }

  loadDashboardData() {
    this.isLoading = true;
    this.errorMessage = null;

    const requests: any = { // Utiliser 'any' pour flexibilité ou typer mieux si possible
      timeEntries: this.entreeDeTempsService.getAllPointages().pipe( map(response => response.data || []), catchError(err => { console.error('Error fetching time entries:', err); this.handleError('Impossible de charger les pointages.'); return of([]); }) ),
      leaves: this.leavesService.getAllLeaves().pipe( catchError(err => { console.error('Error fetching leaves:', err); this.handleError('Impossible de charger les congés.'); return of([]); }) ),
      employees: this.employeeService.getAllEmployees().pipe( catchError(err => { console.error('Error fetching employees:', err); this.handleError('Impossible de charger les employés.'); return of([]); }) ),
      departments: this.departmentService.getAllDepartments().pipe( catchError(err => { console.error('Error fetching departments:', err); this.handleError('Impossible de charger les départements.'); return of([]); }) ),
      // Décommenter si jobPositionService est utilisé
      // jobPositions: this.jobPositionService.getAllJobPositions().pipe( catchError(err => { console.error('Error fetching job positions:', err); this.handleError('Impossible de charger les postes.'); return of([]); }) ),
    };

    forkJoin(requests)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (results: any) => {
          this.allTimeEntries = results.timeEntries;
          this.allLeaves = results.leaves;
          this.allEmployees = results.employees;
          this.allDepartments = results.departments;
          // this.jobPositions = results.jobPositions; // Décommenter si utilisé
          this.processDashboardData();
          this.isLoading = false;
        },
        error: (err) => {
          this.isLoading = false;
          if (!this.errorMessage) { this.errorMessage = 'Une erreur globale est survenue lors du chargement.'; }
          console.error('Global Dashboard loading error:', err);
        },
      });
  }

  handleError(message: string) {
    if (!this.errorMessage) { this.errorMessage = message; }
    // Vider les données
    this.timeEntryChartOptions.series = [] as ApexAxisChartSeries; if(this.timeEntryChartOptions.xaxis) this.timeEntryChartOptions.xaxis.categories = [];
    this.leaveTypePieOptions.series = [] as ApexNonAxisChartSeries; this.leaveTypePieOptions.labels = [];
    this.departmentPieOptions.series = [] as ApexNonAxisChartSeries; this.departmentPieOptions.labels = [];
    this.jobPositionPieOptions.series = [] as ApexNonAxisChartSeries; this.jobPositionPieOptions.labels = [];
    // Cacher les graphiques
    this.showTimeEntryChart = false;
    this.showLeaveTypePie = false;
    this.showDepartmentPie = false;
    this.showJobPositionPie = false; // Utilise cette variable
    this.updateAllCharts();
  }

  processDashboardData() {
    // --- Cartes InfoBox ---
    this.totalEmployees = this.allEmployees.length;
    this.totalDepartments = this.allDepartments.length;
    this.totalPendingLeaves = this.allLeaves.filter(l => l.status?.toUpperCase() === 'PENDING').length;
    this.totalTimeEntriesHours = this.allTimeEntries.reduce((sum, entry) => {
        const durationMinutes = entry.dureeNetteMinutes ?? 0;
        // VÉRIFIER la valeur exacte de statut 'Termine'
        return (durationMinutes > 0 && entry.status === 'Termine') ? sum + (durationMinutes / 60) : sum;
    }, 0);

    // --- Graphiques ---
    this.prepareTimeEntryChart();
    this.prepareLeaveTypePieChart();
    this.prepareDepartmentPieChart();
    this.prepareJobPositionPieChart(); // Prépare ce graphique

    // --- Mise à jour Booléens d'affichage (avec la vérification corrigée) ---
    const timeSeries = this.timeEntryChartOptions.series as ApexAxisChartSeries | undefined;
    this.showTimeEntryChart = !!(timeSeries && timeSeries.length > 0 && timeSeries[0]?.data?.length > 0);
    this.showLeaveTypePie = !!(this.leaveTypePieOptions.series && (this.leaveTypePieOptions.series as number[])?.length > 0);
    this.showDepartmentPie = !!(this.departmentPieOptions.series && (this.departmentPieOptions.series as number[])?.length > 0);
    this.showJobPositionPie = !!(this.jobPositionPieOptions.series && (this.jobPositionPieOptions.series as number[])?.length > 0); // Met à jour ce booléen

    this.updateAllCharts();
  }

  // ================== Préparation Graphiques ===================
  prepareTimeEntryChart() {
    const aggregatedData = this.aggregateTimeEntries(this.allTimeEntries, this.selectedTimeFilter);
    if (aggregatedData.length === 0) {
        this.timeEntryChartOptions.series = [] as ApexAxisChartSeries; if(this.timeEntryChartOptions.xaxis) this.timeEntryChartOptions.xaxis.categories = [];
    } else {
        this.timeEntryChartOptions.series = [{ name: 'Heures Travaillées', data: aggregatedData.map(item => parseFloat(item.totalHours.toFixed(2))), }] as ApexAxisChartSeries;
        if(this.timeEntryChartOptions.xaxis) { this.timeEntryChartOptions.xaxis.categories = aggregatedData.map(item => item.label); this.timeEntryChartOptions.xaxis.title = { text: this.getXAxisTitle(this.selectedTimeFilter) }; }
    }
  }
  aggregateTimeEntries(entries: EntreeDeTempsDTO[], filter: 'day' | 'week' | 'month' | 'year'): { label: string, totalHours: number }[] {
    const aggregation: { [key: string]: number } = {}; entries.forEach(entry => { const durationMinutes = entry.dureeNetteMinutes; if (entry.heureDebut && durationMinutes && durationMinutes > 0 && entry.status === 'Termine') { const startDate = new Date(entry.heureDebut); const durationHours = (durationMinutes / 60); let key = ''; switch (filter) { case 'day': key = startDate.toLocaleDateString('fr-CA'); break; case 'week': key = this.getWeekLabel(startDate); break; case 'month': key = `${startDate.getFullYear()}-${(startDate.getMonth() + 1).toString().padStart(2, '0')}`; break; case 'year': key = startDate.getFullYear().toString(); break; } if (key) { aggregation[key] = (aggregation[key] || 0) + durationHours; } } }); return Object.entries(aggregation).map(([label, totalHours]) => ({ label, totalHours })).sort((a, b) => a.label.localeCompare(b.label));
   }
  getWeekLabel(d: Date): string {
    const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())); date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7)); const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1)); const weekNo = Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7); const dayOfWeek = d.getDay(); const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; const monday = new Date(d); monday.setDate(d.getDate() + diffToMonday); const sunday = new Date(monday); sunday.setDate(monday.getDate() + 6); const year = d.getFullYear(); const mondayStr = monday.toLocaleDateString('fr-CA', { day: '2-digit', month: 'short'}); const sundayStr = sunday.toLocaleDateString('fr-CA', { day: '2-digit', month: 'short' }); return `${year}-W${weekNo.toString().padStart(2, '0')}: ${mondayStr} - ${sundayStr}`;
  }
  getXAxisTitle(filter: string): string {
    switch (filter) { case 'day': return 'Jour'; case 'week': return 'Semaine'; case 'month': return 'Mois'; case 'year': return 'Année'; default: return 'Période'; }
  }
  updateTimeFilter(newFilter: 'day' | 'week' | 'month' | 'year') {
      if (this.selectedTimeFilter !== newFilter) { this.selectedTimeFilter = newFilter; this.prepareTimeEntryChart();
          // Mise à jour du booléen après préparation
          const timeSeries = this.timeEntryChartOptions.series as ApexAxisChartSeries | undefined;
          this.showTimeEntryChart = !!(timeSeries && timeSeries.length > 0 && timeSeries[0]?.data?.length > 0);
          if (this.timeEntryChart && typeof this.timeEntryChart.updateOptions === 'function') { this.timeEntryChart.updateOptions(this.timeEntryChartOptions); }
      }
  }
  prepareLeaveTypePieChart() {
      if (!this.allLeaves || this.allLeaves.length === 0) { this.leaveTypePieOptions.series = [] as ApexNonAxisChartSeries; this.leaveTypePieOptions.labels = []; return; } const leaveCounts: { [type: string]: number } = {}; this.allLeaves.forEach(leave => { const type = leave.type || 'Non spécifié'; leaveCounts[type] = (leaveCounts[type] || 0) + 1; }); this.leaveTypePieOptions.labels = Object.keys(leaveCounts); this.leaveTypePieOptions.series = Object.values(leaveCounts) as ApexNonAxisChartSeries;
  }
  prepareDepartmentPieChart() {
      // Vérifier la présence de employeeIds (array) dans Department model
      const useEmployeeIdsField = this.allDepartments?.length > 0 && this.allDepartments.every(d => Array.isArray(d.employeeIds));
      let labels: string[] = []; let series: number[] = [];
      if (useEmployeeIdsField) { const filteredDepartments = this.allDepartments.filter(d => d.employeeIds!.length > 0); labels = filteredDepartments.map(d => d.departmentName || 'Inconnu'); series = filteredDepartments.map(d => d.employeeIds!.length);
      } else { if (!this.allEmployees || this.allEmployees.length === 0 || !this.allDepartments || this.allDepartments.length === 0) { this.departmentPieOptions.series = [] as ApexNonAxisChartSeries; this.departmentPieOptions.labels = []; return; } const departmentCounts: { [deptName: string]: number } = {}; const departmentIdToNameMap: { [id: number]: string } = {}; this.allDepartments.forEach(dept => { if(dept.departmentId && typeof dept.departmentId === 'number') { const deptName = dept.departmentName || `Dept ${dept.departmentId}`; departmentIdToNameMap[dept.departmentId] = deptName; departmentCounts[deptName] = 0; } }); departmentCounts['Non Assigné'] = 0; this.allEmployees.forEach(emp => { const deptId = emp.departmentId; if (deptId && departmentIdToNameMap[deptId]) { departmentCounts[departmentIdToNameMap[deptId]]++; } else { departmentCounts['Non Assigné']++; } }); labels = Object.keys(departmentCounts).filter(key => departmentCounts[key] > 0); series = labels.map(label => departmentCounts[label]);
      } this.departmentPieOptions.labels = labels; this.departmentPieOptions.series = series as ApexNonAxisChartSeries;
   }
  prepareJobPositionPieChart() {
       // VÉRIFIER que Employee a la propriété 'position'
      if (!this.allEmployees || this.allEmployees.length === 0) { this.jobPositionPieOptions.series = [] as ApexNonAxisChartSeries; this.jobPositionPieOptions.labels = []; return; }
      const positionCounts: { [position: string]: number } = {};
      this.allEmployees.forEach(emp => { const position = emp.position || 'Non spécifié'; positionCounts[position] = (positionCounts[position] || 0) + 1; });
      this.jobPositionPieOptions.labels = Object.keys(positionCounts);
      this.jobPositionPieOptions.series = Object.values(positionCounts) as ApexNonAxisChartSeries;
  }

  // ============== Mise à jour ApexCharts =================
  updateAllCharts() {
    setTimeout(() => { if (this.timeEntryChart && typeof this.timeEntryChart.updateOptions === 'function') { this.timeEntryChart.updateOptions(this.timeEntryChartOptions); } }, 0);
    // Ajouter ici les appels à updateOptions pour les pie charts si nécessaire
  }

  // ============== Options Initiales Graphiques ===============
  private getInitialBarChartOptions(title: string, yAxisTitle: string): Partial<ChartOptions> {
        return { series: [], chart: { type: 'bar', height: 350, foreColor: '#9aa0ac', toolbar: { show: true, tools: { download: true } } }, plotOptions: { bar: { horizontal: false, columnWidth: '55%' } }, dataLabels: { enabled: false }, stroke: { show: true, width: 2, colors: ['transparent'] }, xaxis: { categories: [], title: { text: 'Période' }, labels: { style: { colors: '#9aa0ac' } } }, yaxis: { title: { text: yAxisTitle }, labels: { style: { colors: '#9aa0ac' } } }, fill: { opacity: 1 }, tooltip: { theme: 'dark', y: { formatter: (val) => `${val.toFixed(1)} ${yAxisTitle === 'Heures' ? 'h' : ''}` } }, legend: { show: false }, grid: { borderColor: '#555', strokeDashArray: 3 }, colors: ['#4CB5AC'], title: { text: title, align: 'left', style: { fontSize: '16px', color: '#ccc' } }, responsive: [ { breakpoint: 768, options: { chart: { height: 300 }, plotOptions: { bar: { columnWidth: '70%' } } } }, { breakpoint: 480, options: { chart: { height: 250 }, plotOptions: { bar: { columnWidth: '85%' } }, xaxis: { labels: { rotate: -45, style: { fontSize: '10px' } } } } } ] };
   }
  private getInitialPieChartOptions(title: string): Partial<ChartOptions> {
        return { series: [], chart: { type: 'pie', height: 320, foreColor: '#9aa0ac' }, labels: [], colors: ["#3FA7DC", "#F6A025", "#9BC311", "#E15829", "#556B2F", "#9932CC", "#8FBC8F"], legend: { show: true, position: 'bottom', labels: { colors: '#ccc' } }, dataLabels: { enabled: true, formatter: (val: number) => `${val.toFixed(1)}%`, style: { fontSize: '12px', colors: ["#fff"] }, dropShadow: { enabled: true, top: 1, left: 1, blur: 1, opacity: 0.45 } }, tooltip: { theme: 'dark', y: { formatter: (value: number, { seriesIndex, w }: any) => `${w.globals.labels[seriesIndex]}: ${value}`, title: { formatter: () => '' } } }, title: { text: title, align: 'left', style: { fontSize: '16px', color: '#ccc'} }, responsive: [ { breakpoint: 480, options: { chart: { height: 280 }, legend: { position: 'bottom' } } } ] };
   }
}