import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
// Suppression des imports non utilisés pour CommonModule, NgIf, etc. car gérés par standalone imports
// import { CommonModule, NgIf, NgFor, NgClass } from '@angular/common'; // Plus nécessaire ici
// import { RouterLink, RouterModule } from '@angular/router'; // Non utilisé ici
import { FormsModule } from '@angular/forms'; // Gardé car utilisé pour [(ngModel)]

import { ChartComponent, NgApexchartsModule, ApexAxisChartSeries, ApexChart, ApexDataLabels, ApexStroke, ApexTitleSubtitle, ApexXAxis, ApexYAxis, ApexGrid, ApexTooltip, ApexLegend, ApexFill, ApexResponsive, ApexNonAxisChartSeries, ApexMarkers, ApexPlotOptions } from 'ng-apexcharts';
import { Subject, forkJoin, of } from 'rxjs';
import { takeUntil, map, catchError } from 'rxjs/operators';

// Services
import { EmployeeService } from '../../../../services/employee.service'; // VÉRIFIER CHEMIN
import { DepartmentService } from '../../../../services/department.service'; // VÉRIFIER CHEMIN
import { LeavesService } from 'app/admin/leaves/leave-requests/leaves.service'; // VÉRIFIER CHEMIN
import { EntreeDeTempsService } from '../../../services/entree-de-temps.service'; // VÉRIFIER CHEMIN
// import { ExpenseService } from '../../expenses/expense.service'; // Non utilisé apparemment
// import { JobPositionService } from '../../../../services/JobPosition.service'; // Non utilisé apparemment
import { ChangeDetectorRef } from '@angular/core';
import { Employee } from 'app/admin/leaves/leave-requests/employee.model'; // VÉRIFIER CHEMIN & PROPRIETES
import { Department } from '../../../../models/department.model'; // VÉRIFIER CHEMIN & PROPRIETES
import { Leaves } from '../../leaves/leave-requests/leaves.model'; // VÉRIFIER CHEMIN & PROPRIETES
import { EntreeDeTempsDTO } from '../../../models/entree-de-temps.dto'; // VÉRIFIER CHEMIN & PROPRIETES
// import { Expense } from '../../expenses/expense.model'; // Non utilisé apparemment
// import { JobPosition } from '../../../../models/JobPosition.model'; // Non utilisé apparemment

// !! VÉRIFIEZ ces chemins !!
import { SentimentDashboardData } from '../../leaves/sentiment-dashboard-data.model';
import { MotivationTrendPoint } from '../../leaves/motivation-trend-point.model';

// --- Components (UI) ---

// --- Type ChartOptions (inchangé) ---

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
  @ViewChild('timeEntryChart') timeEntryChart!: ChartComponent;
  @ViewChild('sentimentPieChart') sentimentPieChart!: ChartComponent;
  @ViewChild('motivationLineChart') motivationLineChart!: ChartComponent;
  @ViewChild('deptPieChart') deptPieChart!: ChartComponent;
  @ViewChild('posPieChart') posPieChart!: ChartComponent;

  title = 'HR Dashboard';

  // --- Options des Graphiques ---
  public timeEntryChartOptions!: Partial<ChartOptions>;
  public departmentPieOptions!: Partial<ChartOptions>;
  public jobPositionPieOptions!: Partial<ChartOptions>;
  public sentimentPieChartOptions!: Partial<ChartOptions>; // Ajouté
  public motivationLineChartOptions!: Partial<ChartOptions>; // Ajouté

  // --- États d'Affichage ---
  showTimeEntryChart = false;
  showDepartmentPie = false;
  showJobPositionPie = false;
  showSentimentPie = false; // Ajouté
  showMotivationLine = false; // Ajouté

  // --- Statistiques pour InfoBox ---
  totalEmployees = 0;
  totalDepartments = 0;
  totalTimeEntriesHours = 0; // Déclaré
  totalPendingLeaves = 0; // Déclaré

  // --- Filtres et État ---
  selectedTimeFilter: 'day' | 'week' | 'month' | 'year' = 'week';
  isLoading = true;
  errorMessage: string | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private employeeService: EmployeeService,
    private departmentService: DepartmentService,
    private leavesService: LeavesService,
    private entreeDeTempsService: EntreeDeTempsService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.initializeChartOptions();
    this.loadDashboardData();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Initialise TOUTES les options de graphique
  initializeChartOptions() {
    this.timeEntryChartOptions = this.getInitialBarChartOptions('Working Hours', 'Hours');
    this.departmentPieOptions = this.getInitialPieChartOptions('Employees by Department');
    this.jobPositionPieOptions = this.getInitialPieChartOptions('Employees by Position');
    this.sentimentPieChartOptions = this.getInitialPieChartOptions('Leave Sentiment Analysis'); // Ajouté
    this.motivationLineChartOptions = this.getInitialLineChartOptions('Motivation Trend (Leaves)', 'Avg. Score'); // Ajouté
  }

  // Charge toutes les données nécessaires pour le dashboard
  loadDashboardData() {
    this.isLoading = true;
    this.errorMessage = null;

    const requests = {
      timeEntries: this.entreeDeTempsService.getAllPointages().pipe( map(response => Array.isArray(response) ? response : (response as any)?.data ?? []), catchError(err => { console.error('Error fetching time entries:', err); this.handleError('Could not load time entries.'); return of([]); }) ),
      employees: this.employeeService.getAllEmployees().pipe( catchError(err => { console.error('Error fetching employees:', err); this.handleError('Could not load employees.'); return of([]); }) ),
      departments: this.departmentService.getAllDepartments().pipe( catchError(err => { console.error('Error fetching departments:', err); this.handleError('Could not load departments.'); return of([]); }) ),
      sentimentData: this.leavesService.getSentimentDashboardData().pipe( catchError(err => { console.error('Error fetching sentiment data:', err); this.handleError('Could not load sentiment data.'); return of(null); }) ),
      allLeaves: this.leavesService.getAllLeaves().pipe( catchError(err => { console.error('Error fetching all leaves:', err); this.handleError('Could not load leaves data.'); return of([]); }) )
    };

    forkJoin(requests).pipe(takeUntil(this.destroy$)).subscribe({
      next: (results: any) => {
        try {
          const allTimeEntries = results.timeEntries as EntreeDeTempsDTO[];
          const allEmployees = results.employees as Employee[];
          const allDepartments = results.departments as Department[];
          const sentimentData = results.sentimentData as SentimentDashboardData | null;
          const allLeaves = results.allLeaves as Leaves[];

          this.totalEmployees = allEmployees.length;
          this.totalDepartments = allDepartments.length;
          this.totalTimeEntriesHours = allTimeEntries.reduce((sum, entry) => { const durationMinutes = entry.dureeNetteMinutes; return (durationMinutes != null && durationMinutes > 0 && entry.status === 'Termine') ? sum + (durationMinutes / 60) : sum; }, 0);
          this.totalPendingLeaves = allLeaves.filter(l => l.status?.toUpperCase() === 'PENDING').length;

          this.prepareTimeEntryChart(allTimeEntries);
          this.prepareDepartmentPieChart_Alternative(allEmployees, allDepartments); // Utilisation de la méthode alternative
          this.prepareJobPositionPieChart(allEmployees);
          if (sentimentData) {
              this.prepareSentimentPieChart(sentimentData.sentimentCounts);
              this.prepareMotivationLineChart(sentimentData.motivationTrend);
          } else { this.resetSentimentCharts(); }
          this.updateChartVisibility();
        } catch (processingError) { this.handleError("Error processing dashboard data."); console.error(processingError); }
        finally { this.isLoading = false; this.cdr.detectChanges(); this.updateAllCharts(); }
      },
      error: (err) => { /* ... gestion erreur globale ... */ }
    });
}

  // Gère les erreurs d'appels API individuels
  handleError(message: string) {
    if (!this.errorMessage) { this.errorMessage = message; }
    // Ne pas nécessairement réinitialiser/cacher tous les graphiques ici,
    // forkJoin continuera si possible grâce aux catchError individuels retournant of([]) ou of(null)
  }

  // ================== Préparation Graphiques ===================

  // Méthode existante (normalement correcte si EmployeeService est corrigé)
  prepareTimeEntryChart(entries: EntreeDeTempsDTO[]) {
      const aggregatedData = this.aggregateTimeEntries(entries, this.selectedTimeFilter);
      const seriesData = aggregatedData.map(item => parseFloat(item.totalHours.toFixed(2)));
      const categoriesData = aggregatedData.map(item => item.label);
      this.timeEntryChartOptions.series = [{ name: 'Worked Hours', data: seriesData }];
      if (this.timeEntryChartOptions.xaxis) {
          this.timeEntryChartOptions.xaxis.categories = categoriesData;
          this.timeEntryChartOptions.xaxis.title = { text: this.getXAxisTitle(this.selectedTimeFilter) };
      }
  }

  // Méthode existante (corrigée pour utiliser l'objet Employee correct)
  prepareDepartmentPieChart_Alternative(employees: any[], departments: Department[]): void {
    console.log("--- Preparing Department Pie (Alternative) ---");
    console.log("Input Employees (sample):", JSON.stringify(employees.slice(0, 2))); // Log pour voir la structure REELLE
    console.log("Input Departments (sample):", JSON.stringify(departments.slice(0, 2)));

    if (!employees || employees.length === 0 || !departments || departments.length === 0) {
        this.resetDepartmentChart(); console.log("Dept Pie Reset - No employees or departments.");
        this.updateChartVisibility(); return;
    }

    const departmentCounts: { [deptName: string]: number } = {};
    // Créer une map ID -> Nom à partir des départements chargés
    const departmentIdToNameMap: { [id: number]: string } = {};
    departments.forEach(dept => {
        if (dept.departmentId) {
            departmentIdToNameMap[dept.departmentId] = dept.departmentName || `Dept ${dept.departmentId}`;
            departmentCounts[departmentIdToNameMap[dept.departmentId]] = 0; // Initialiser
        }
    });
    departmentCounts['Not Assigned'] = 0; // Catégorie fourre-tout

    // Compter les employés
    employees.forEach(emp => {
        let assignedDeptName: string | undefined = undefined;
        // Tentative 1: Utiliser l'objet imbriqué s'il existe (méthode préférée SI le service mappe correctement)
        if (emp.department && typeof emp.department === 'object' && emp.department.departmentId) {
            assignedDeptName = emp.department.departmentName || departmentIdToNameMap[emp.department.departmentId];
        }
        // Tentative 2: Utiliser un departmentId directement sur l'employé (si le mapping service a échoué mais que l'ID est là)
        else if (emp.departmentId && departmentIdToNameMap[emp.departmentId]) {
             console.warn(`Employee ${emp.id}: Using direct departmentId ${emp.departmentId}. Consider fixing EmployeeService mapping.`);
             assignedDeptName = departmentIdToNameMap[emp.departmentId];
        }

        // Assigner le compte
        if (assignedDeptName && departmentCounts.hasOwnProperty(assignedDeptName)) {
            departmentCounts[assignedDeptName]++;
        } else {
            // console.log(`Employee ${emp.id} assigned to 'Not Assigned'. Found Dept Name: ${assignedDeptName}`);
            departmentCounts['Not Assigned']++;
        }
    });
    console.log("Final Department Counts (Alternative):", JSON.stringify(departmentCounts));

    const labels = Object.keys(departmentCounts).filter(key => departmentCounts[key] > 0);
    if (labels.length === 0) { this.resetDepartmentChart(); console.log("Dept Pie Reset - All counts zero (Alternative)."); this.updateChartVisibility(); return; }
    const series = labels.map(label => departmentCounts[label]);

    console.log("Department Pie - Final Labels (Alternative):", labels);
    console.log("Department Pie - Final Series (Alternative):", series);

    this.departmentPieOptions = { ...this.departmentPieOptions, labels: labels, series: series };
    // this.updateChartVisibility(); // Appelé globalement après
    console.log("--- Department Pie Prepared (Alternative) ---");
}

  // Méthode existante (normalement correcte)
   prepareJobPositionPieChart(employees: Employee[]) {
       if (!employees || employees.length === 0) { this.resetPositionChart(); return; }
       const positionCounts: { [position: string]: number } = {};
       employees.forEach(emp => { const position = emp.position || 'Not Specified'; positionCounts[position] = (positionCounts[position] || 0) + 1; });
       const labels = Object.keys(positionCounts).filter(key => positionCounts[key] > 0);
       if (labels.length === 0) { this.resetPositionChart(); return; }
       this.jobPositionPieOptions.labels = labels;
       this.jobPositionPieOptions.series = Object.values(positionCounts).filter(count => count > 0);
   }

   // --- NOUVELLES Méthodes de Préparation ---
   prepareSentimentPieChart(sentimentCounts: { [sentimentLabel: string]: number } | null | undefined) {
       if (!sentimentCounts || Object.keys(sentimentCounts).length === 0) {
           this.resetSentimentCharts(); return;
       }
       const labels = Object.keys(sentimentCounts);
       const series = labels.map(label => sentimentCounts[label]);
       this.sentimentPieChartOptions.labels = labels;
       this.sentimentPieChartOptions.series = series;
       this.sentimentPieChartOptions.colors = labels.map(label => this.getColorForSentiment(label));
   }

   prepareMotivationLineChart(motivationTrend: MotivationTrendPoint[] | null | undefined) {
       if (!motivationTrend || motivationTrend.length === 0) {
          this.resetSentimentCharts(); return;
       }
       // Trier les points par période au cas où ils ne le seraient pas
       motivationTrend.sort((a, b) => a.period.localeCompare(b.period));
       this.motivationLineChartOptions.series = [{
           name: 'Motivation Score',
           data: motivationTrend.map(p => parseFloat(p.score.toFixed(2)))
       }];
       if (this.motivationLineChartOptions.xaxis) {
            this.motivationLineChartOptions.xaxis.categories = motivationTrend.map(p => p.period);
            this.motivationLineChartOptions.xaxis.title = { text: 'Month' };
       }
       if (this.motivationLineChartOptions.yaxis && !Array.isArray(this.motivationLineChartOptions.yaxis)) {
            this.motivationLineChartOptions.yaxis.min = -2.5;
            this.motivationLineChartOptions.yaxis.max = 2.5;
       }
   }

  // --- Méthodes pour vider les données des graphiques ---
  resetAllChartsData() {
      this.resetTimeEntryChart();
      this.resetDepartmentChart();
      this.resetPositionChart();
      this.resetSentimentCharts();
  }
  resetTimeEntryChart() { this.timeEntryChartOptions.series = []; if(this.timeEntryChartOptions.xaxis) this.timeEntryChartOptions.xaxis.categories = []; }
  resetDepartmentChart() { this.departmentPieOptions.series = []; this.departmentPieOptions.labels = []; }
  resetPositionChart() { this.jobPositionPieOptions.series = []; this.jobPositionPieOptions.labels = []; }
  resetSentimentCharts() {
      this.sentimentPieChartOptions.series = []; this.sentimentPieChartOptions.labels = [];
      this.motivationLineChartOptions.series = []; if(this.motivationLineChartOptions.xaxis) this.motivationLineChartOptions.xaxis.categories = [];
  }

  // --- Mise à jour Visibilité ---
  updateChartVisibility(): void {
    const hasValidData = (series: any): boolean => {
      if (!series || !Array.isArray(series) || series.length === 0) return false;
      if (typeof series[0] === 'number') return (series as number[]).some(v => v > 0);
      if (typeof series[0] === 'object' && series[0]?.data) {
          return (series[0].data as any[])?.some(d => d !== null && d !== undefined && !isNaN(d));
      }
      return false;
    };

    this.showTimeEntryChart = hasValidData(this.timeEntryChartOptions?.series);
    this.showDepartmentPie = hasValidData(this.departmentPieOptions?.series);
    this.showJobPositionPie = hasValidData(this.jobPositionPieOptions?.series);
    this.showSentimentPie = hasValidData(this.sentimentPieChartOptions?.series);
    this.showMotivationLine = hasValidData(this.motivationLineChartOptions?.series);
    // Forcer la détection ici peut aider après la mise à jour des booléens
    this.cdr.detectChanges();
}

  // --- Mise à jour ApexCharts ---
  updateAllCharts() {
    setTimeout(() => {
      this.tryUpdateChart(this.timeEntryChart, this.timeEntryChartOptions);
      this.tryUpdateChart(this.sentimentPieChart, this.sentimentPieChartOptions);
      this.tryUpdateChart(this.motivationLineChart, this.motivationLineChartOptions);
      this.tryUpdateChart(this.deptPieChart, this.departmentPieOptions);
      this.tryUpdateChart(this.posPieChart, this.jobPositionPieOptions);
    }, 100);
  }

  // --- Helpers ---
  private tryUpdateChart(chartInstance: ChartComponent | undefined, options: Partial<ChartOptions> | undefined): void { if (chartInstance && options && typeof chartInstance.updateOptions === 'function') { chartInstance.updateOptions(options).catch(err => console.error("Chart update error:", err)); } }
  aggregateTimeEntries(entries: EntreeDeTempsDTO[], filter: 'day' | 'week' | 'month' | 'year'): { label: string, totalHours: number }[] { const aggregation: { [key: string]: number } = {}; entries.forEach(entry => { const durationMinutes = entry.dureeNetteMinutes; if (entry.heureDebut && durationMinutes != null && durationMinutes > 0 && entry.status === 'Termine') { try { const startDate = new Date(entry.heureDebut); if (isNaN(startDate.getTime())) { return; } const durationHours = (durationMinutes / 60); let key = ''; switch (filter) { case 'day': key = startDate.toLocaleDateString('fr-CA'); break; case 'week': key = this.getWeekLabel(startDate); break; case 'month': key = `${startDate.getFullYear()}-${(startDate.getMonth() + 1).toString().padStart(2, '0')}`; break; case 'year': key = startDate.getFullYear().toString(); break; } if (key) { aggregation[key] = (aggregation[key] || 0) + durationHours; } } catch (e) { console.error(`Error processing time entry ID ${entry.id}:`, e); } } }); return Object.entries(aggregation).map(([label, totalHours]) => ({ label, totalHours })).sort((a, b) => a.label.localeCompare(b.label)); }
  getWeekLabel(d: Date): string { const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())); date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7)); const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1)); const weekNo = Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7); const monday = new Date(d); monday.setDate(d.getDate() - d.getDay() + (d.getDay() === 0 ? -6 : 1)); const sunday = new Date(monday); sunday.setDate(monday.getDate() + 6); const year = d.getFullYear(); const mondayStr = monday.toLocaleDateString('fr-CA', { day: '2-digit', month: 'short'}); const sundayStr = sunday.toLocaleDateString('fr-CA', { day: '2-digit', month: 'short' }); return `${year}-W${weekNo.toString().padStart(2, '0')}`; }
  getXAxisTitle(filter: string): string { switch (filter) { case 'day': return 'Day'; case 'week': return 'Week'; case 'month': return 'Month'; case 'year': return 'Year'; default: return 'Period'; } }
  updateTimeFilter(newFilter: 'day' | 'week' | 'month' | 'year'): void { if (this.selectedTimeFilter !== newFilter) { this.selectedTimeFilter = newFilter; this.loadDashboardData(); } }
  getColorForSentiment(sentimentLabel: string): string { if (sentimentLabel?.includes('Très positif')) return '#198754'; if (sentimentLabel?.includes('Positif')) return '#20c997'; if (sentimentLabel?.includes('Neutre')) return '#ffc107'; if (sentimentLabel?.includes('Négatif')) return '#fd7e14'; if (sentimentLabel?.includes('Très négatif')) return '#dc3545'; return '#6c757d'; }

  // ============== Options Initiales Graphiques ===============
  private getInitialBarChartOptions(title: string, yAxisTitle: string): Partial<ChartOptions> { return { series: [], chart: { type: 'bar', height: 350, foreColor: '#9aa0ac', toolbar: { show: true } }, plotOptions: { bar: { horizontal: false, columnWidth: '55%' } }, dataLabels: { enabled: false }, stroke: { show: true, width: 2, colors: ['transparent'] }, xaxis: { categories: [], title: { text: 'Period' }, labels: { style: { colors: '#9aa0ac' } } }, yaxis: { title: { text: yAxisTitle }, labels: { style: { colors: '#9aa0ac' } } }, fill: { opacity: 1 }, tooltip: { theme: 'dark', y: { formatter: (val) => `${val?.toFixed(1)} ${yAxisTitle === 'Hours' ? 'h' : ''}` } }, legend: { show: false }, grid: { borderColor: '#555', strokeDashArray: 3 }, colors: ['#4CB5AC'], title: { text: title, align: 'left', style: { fontSize: '16px', color: '#ccc' } }, responsive: [ /* ... */ ] }; }
  private getInitialPieChartOptions(title: string): Partial<ChartOptions> { return { series: [], chart: { type: 'pie', height: 320, foreColor: '#9aa0ac' }, labels: [], colors: ["#3FA7DC", "#F6A025", "#9BC311", "#E15829", "#556B2F", "#9932CC", "#8FBC8F", "#DC143C"], legend: { show: true, position: 'bottom', labels: { colors: '#ccc' } }, dataLabels: { enabled: true, formatter: (val: number) => `${val?.toFixed(1)}%`, style: { fontSize: '12px', colors: ["#fff"] }, dropShadow: { enabled: true } }, tooltip: { theme: 'dark', y: { formatter: (value: number, { seriesIndex, w }: any) => `${w?.globals?.labels?.[seriesIndex] ?? ''}: ${value}`, title: { formatter: () => '' } } }, title: { text: title, align: 'left', style: { fontSize: '16px', color: '#ccc'} }, responsive: [ /* ... */ ] }; }
  private getInitialLineChartOptions(title: string, yAxisTitle: string): Partial<ChartOptions> { return { series: [], chart: { type: 'line', height: 350, foreColor: '#9aa0ac', toolbar: { show: true }, zoom: { enabled: true } }, dataLabels: { enabled: false }, stroke: { curve: 'smooth', width: 3 }, markers: { size: 4 }, xaxis: { type: 'category', categories: [], title: { text: 'Period (Month)' }, labels: { style: { colors: '#9aa0ac' }, rotate: -45, trim: true, hideOverlappingLabels: true, } }, yaxis: { title: { text: yAxisTitle }, min: -2.5, max: 2.5, labels: { style: { colors: '#9aa0ac' }, formatter: (val) => val.toFixed(1) } }, grid: { borderColor: '#555', strokeDashArray: 3 }, tooltip: { theme: 'dark', x: { format: 'yyyy-MM' }, y: { formatter: (val) => val?.toFixed(2) } }, title: { text: title, align: 'left', style: { fontSize: '16px', color: '#ccc' } }, colors: ['#00E396'] }; }
}