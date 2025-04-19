import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
// --- IMPORTS MODIFIÉS ---
import { EntreeDeTempsService } from '../../../services/entree-de-temps.service'; // CHEMIN VERS VOTRE NOUVEAU SERVICE
import { EntreeDeTempsDTO } from 'app/models/entree-de-temps.dto';          // CHEMIN VERS VOTRE MODÈLE DTO
import { Status as PointageStatus } from 'app/models/status.enum'; // Renommer Status pour éviter conflit potentiel
// -----------------------
import { HttpClient } from '@angular/common/http'; // Gardé si utilisé ailleurs, sinon potentiellement retirable
import { MatDialog } from '@angular/material/dialog'; // Gardé si vous voulez des dialogs pour d'autres actions
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import {
  MatSnackBar,
  MatSnackBarHorizontalPosition,
  MatSnackBarVerticalPosition,
} from '@angular/material/snack-bar';
import { MatMenuTrigger, MatMenuModule } from '@angular/material/menu';
import { Subject } from 'rxjs';
import { SelectionModel } from '@angular/cdk/collections';
import { rowsAnimation } from '@shared'; // Gardé pour animation
import { TableExportUtil } from '@shared'; // Gardé pour export
import { DatePipe, NgClass } from '@angular/common'; // Import DatePipe
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
// --- IMPORTS SUPPRIMÉS (pour Dialogs) ---
// import { TodayFormComponent } from './dialog/form-dialog/form-dialog.component';
// import { TodayDeleteComponent } from './dialog/delete/delete.component';
// -----------------------------------

@Component({
  selector: 'app-today', // Le sélecteur reste le même
  templateUrl: './today.component.html',
  styleUrls: ['./today.component.scss'], // Les styles restent les mêmes
  standalone: true, // Correction : mise à standalone=true et imports ici
  animations: [rowsAnimation],
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
    DatePipe, // Ajouter DatePipe ici
  ],
})
export class TodayComponent implements OnInit, OnDestroy {
  // --- NOUVELLES DÉFINITIONS DE COLONNES ---
  columnDefinitions = [
    // { def: 'select', label: 'Checkbox', type: 'check', visible: true }, // Gardons la sélection ? Peut-être pas utile ici. A discuter.
    { def: 'id', label: 'ID', type: 'number', visible: false },
    { def: 'employeeFullName', label: 'Employé', type: 'text', visible: true },
    { def: 'typeEntreeDeTemps', label: 'Type', type: 'text', visible: true },
    { def: 'heureDebut', label: 'Début', type: 'datetime', visible: true },
    { def: 'heureFin', label: 'Fin', type: 'datetime', visible: true },
    { def: 'dureeNetteMinutes', label: 'Durée Trav.', type: 'duration', visible: true },
    { def: 'dureePauseMinutes', label: 'Durée Pause', type: 'duration', visible: true },
    { def: 'status', label: 'Statut', type: 'enum', visible: false },
    { def: 'notes', label: 'Notes', type: 'text', visible: true }, // Masqué par défaut
    { def: 'localisationDebutAdresse', label: 'Adresse Début', type: 'address', visible: true },
    // Actions supprimées pour l'instant
    // { def: 'actions', label: 'Actions', type: 'actionBtn', visible: true },
  ];
  // Statut Pointage Renommé
  PointageStatusEnum = PointageStatus; // Exposer l'enum au template si besoin avec alias

  // --- TYPES MIS À JOUR ---
  dataSource = new MatTableDataSource<EntreeDeTempsDTO>([]);
  selection = new SelectionModel<EntreeDeTempsDTO>(true, []); // Sélection peut ne plus être pertinente
  // --------------------
  contextMenuPosition = { x: '0px', y: '0px' };
  isLoading = true;
  private destroy$ = new Subject<void>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('filter') filter!: ElementRef;
  @ViewChild(MatMenuTrigger) contextMenu?: MatMenuTrigger;
  // Garder le ViewChild pour pouvoir ouvrir le select
  @ViewChild('select') columnSelect!: ElementRef<HTMLSelectElement>;

  constructor(
    public httpClient: HttpClient, // Gardé mais peut-être inutile
    public dialog: MatDialog, // Gardé mais peut-être inutile sans CRUD dialogs
    // --- INJECTION SERVICE MODIFIÉE ---
    public entreeDeTempsService: EntreeDeTempsService,
    // -------------------------------
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef // Injectez ChangeDetectorRef

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

  // Ne change pas
  getDisplayedColumns(): string[] {
    return this.columnDefinitions
      .filter((cd) => cd.visible)
      .map((cd) => cd.def);
  }
 
 
  // La fonction (ngModelChange) n'est plus nécessaire, mais on peut forcer un re-render
  // après la sélection pour que la table se mette à jour si on utilise OnPush.
  onColumnVisibilityChange() {
     console.log("Visibility changed, triggering CD");
     this.cdr.detectChanges(); // Forcer la détection si OnPush
     // Vous pourriez sauvegarder l'état des colonnes dans le localStorage ici
  }
  // --- MÉTHODE loadData MODIFIÉE ---
  loadData() {
    this.isLoading = true; // Afficher le spinner
    this.entreeDeTempsService.getAllPointages().subscribe({
      next: (response) => {
        if (response.success) {
          // Mapper pour formater potentiellement certaines données si nécessaire ici
          // Ex: Convertir les minutes en hh:mm ? Non, faisons ça dans le template
          this.dataSource.data = response.data || []; // Assurer un tableau vide si data est null/undefined
          this.refreshTable(); // Mettre à jour pagination/tri après MAJ data
        } else {
          console.error('Erreur API lors du chargement des pointages:', response.message);
          this.showNotification('snackbar-danger', response.message || 'Erreur chargement données', 'bottom', 'center');
          this.dataSource.data = []; // Vider le tableau en cas d'erreur API
        }
        this.isLoading = false; // Cacher le spinner
        // Filtre prédicat (gardé, devrait fonctionner)
        this.dataSource.filterPredicate = (data: EntreeDeTempsDTO, filter: string) => {
             const dataStr = JSON.stringify(data).toLowerCase();
             return dataStr.indexOf(filter) !== -1;
        };
      },
      error: (err) => {
        console.error('Erreur HTTP lors du chargement des pointages:', err);
        this.showNotification('snackbar-danger', `Erreur HTTP: ${err.message || 'Erreur inconnue'}`, 'bottom', 'center');
        this.isLoading = false; // Cacher le spinner
        this.dataSource.data = []; // Vider le tableau en cas d'erreur HTTP
      },
    });
  }
  // -----------------------------

  private refreshTable() {
    // Assurer que paginator et sort sont disponibles
    if (this.dataSource.data.length > 0) {
       if (this.paginator) {
           this.paginator.pageIndex = 0; // Reset page index
           this.dataSource.paginator = this.paginator;
       }
       if (this.sort) {
           this.dataSource.sort = this.sort;
       }
    } else {
        this.dataSource.paginator = null; // Détacher si pas de données
        this.dataSource.sort = null;
    }
    // Pour forcer la MaJ de la source après changement de data
    this.dataSource._updateChangeSubscription();
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value
      .trim()
      .toLowerCase();
    this.dataSource.filter = filterValue;
    if (this.dataSource.paginator) {
        this.dataSource.paginator.firstPage(); // Retour à la première page sur filtre
    }
  }

  // --- Fonctions CRUD supprimées ou commentées ---
  /*
  addNew() {
    // Plus pertinent ici, le pointage se fait via le header
    // Si vous voulez ajouter/modifier manuellement => nouveau dialogue + service backend
     this.showNotification('snackbar-warning', 'Action non disponible ici.', 'bottom', 'center');
  }

  editCall(row: EntreeDeTempsDTO) {
    // Idem, édition manuelle nécessite dialogue + backend
     this.showNotification('snackbar-warning', 'Action non disponible ici.', 'bottom', 'center');
  }

  deleteItem(row: EntreeDeTempsDTO) {
    // Suppression individuelle possible si vous ajoutez endpoint backend et méthode service
    // Pour l'instant, utilisez deleteAll via un autre bouton admin si nécessaire
     this.showNotification('snackbar-warning', 'Action non disponible ici.', 'bottom', 'center');
  }

  removeSelectedRows() {
    // Suppression en masse non prévue pour l'instant
    this.showNotification('snackbar-warning', 'Action non disponible ici.', 'bottom', 'center');
  }
  */
  // ------------------------------------------

  showNotification( // Gardée car utilisée dans loadData
    colorName: string,
    text: string,
    placementFrom: MatSnackBarVerticalPosition,
    placementAlign: MatSnackBarHorizontalPosition
  ) {
    this.snackBar.open(text, '', {
      duration: 3000, // Augmenter durée?
      verticalPosition: placementFrom,
      horizontalPosition: placementAlign,
      panelClass: colorName,
    });
  }

  // --- EXPORT MODIFIÉ ---
  exportExcel() {
     // Vérifier qu'il y a des données filtrées
     if (!this.dataSource.filteredData || this.dataSource.filteredData.length === 0) {
        this.showNotification('snackbar-warning', 'Aucune donnée à exporter.', 'bottom', 'center');
        return;
     }
     // Utiliser DatePipe pour formater
     const datePipe = new DatePipe('en-US'); // Ou 'fr-FR' etc.
     const formatDateTime = (dateString: string | undefined | null): string => {
         return dateString ? datePipe.transform(dateString, 'yyyy-MM-dd HH:mm') || '' : '';
     };
     const formatDuration = (minutes: number | undefined | null): string => {
        if (minutes === undefined || minutes === null) return '';
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        return `${h}h ${m}m`;
     };


    const exportData = this.dataSource.filteredData.map((x) => ({
      ID: x.id,
      Employé: x.employeeFullName,
      Type: x.typeEntreeDeTemps,
      Début: formatDateTime(x.heureDebut),
      Fin: formatDateTime(x.heureFin),
      'Durée Trav.': formatDuration(x.dureeNetteMinutes),
      'Durée Pause': formatDuration(x.dureePauseMinutes),
      Statut: x.status,
      Notes: x.notes || '', // Mettre '' si null/undefined
      Mode: x.restrictionsHorloge,
      // Ajoutez d'autres champs si besoin (localisation, etc.)
    }));

    TableExportUtil.exportToExcel(exportData, 'pointages_export');
  }
  // ----------------------

  // --- Gestion Sélection (Gardée mais peut-être inutile) ---
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
  // -----------------------------------------------------

  // --- Menu Contextuel Simplifié ---
  onContextMenu(event: MouseEvent, item: EntreeDeTempsDTO) {
    event.preventDefault();
    this.contextMenuPosition = {
      x: `${event.clientX}px`,
      y: `${event.clientY}px`,
    };
    if (this.contextMenu) {
      this.contextMenu.menuData = { item }; // Passer l'item au menu
      this.contextMenu.menu?.focusFirstItem('mouse');
      this.contextMenu.openMenu();
    }
  }
   // Ajoutez ici des actions spécifiques pour le menu contextuel si nécessaire
   viewDetails(item: EntreeDeTempsDTO) {
      // Ouvrir un dialogue affichant TOUS les détails de l'item ?
      console.log("Voir détails pour:", item);
      alert(`Détails pour ID ${item.id}\nEmployé: ${item.employeeFullName}\nStatut: ${item.status}\nNotes: ${item.notes || 'Aucune'}`);
   }
  // -------------------------------
}