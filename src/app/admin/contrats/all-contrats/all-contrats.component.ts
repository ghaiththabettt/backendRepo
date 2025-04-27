import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ContratService } from '../contrat.service';
import { Contrat } from '../contrat.model';
import { UnsubscribeOnDestroyAdapter } from '@shared';

// Import Angular Material Dialog and your new form component
import { MatDialog, MatDialogModule } from '@angular/material/dialog'; // Import MatDialog, MatDialogModule
import { ContratFormComponent } from '../contrat-form/contrat-form.component'; // Import your new form component

import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
// Router is no longer needed for add/edit navigation from this component
// import { Router } from '@angular/router';

@Component({
  selector: 'app-all-contrats',
  templateUrl: './all-contrats.component.html',
  styleUrls: ['./all-contrats.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    DatePipe,
    MatDialogModule // Import MatDialogModule here as AllContratsComponent uses MatDialog
  ],
})
export class AllContratsComponent extends UnsubscribeOnDestroyAdapter implements OnInit, OnDestroy {
  contrats: Contrat[] = [];
  loading = true;

  constructor(
    private contratService: ContratService,
    // Router is not needed for add/edit navigation now
    // private router: Router,
    // Inject MatDialog service
    public dialog: MatDialog // Make it public if you need to access it in the template (less common)
  ) {
    super();
  }

   ngOnInit(): void { // Use override
    this.loadContrats();
  }

  loadContrats(): void {
    this.loading = true;
    this.subs.sink = this.contratService.getAllContrats().subscribe({
      next: (data) => {
        this.contrats = data;
        this.loading = false;
        console.log('Contrats loaded:', this.contrats);
      },
      error: (error) => {
        console.error('Erreur lors du chargement des contrats', error);
        this.loading = false;
        alert('Erreur lors du chargement des contrats. Veuillez réessayer.');
      }
    });
  }

  // --- New method to open the Add Contract dialog ---
  addContratDialog(): void {
    const dialogRef = this.dialog.open(ContratFormComponent, {
      width: '800px', // Augmentation de la largeur
      maxWidth: '90vw', // Limite à 90% de la largeur de la fenêtre
      height: '80vh', // Hauteur fixe à 80% de la hauteur de la fenêtre
      maxHeight: '90vh', // Limite à 90% de la hauteur de la fenêtre
      panelClass: 'contrat-dialog-container', // Classe personnalisée pour le style
      disableClose: false, // Permet de fermer en cliquant à l'extérieur
      autoFocus: false, // Évite l'autofocus qui peut perturber le défilement
      data: null // Pass null to indicate 'add' mode
    });

    this.subs.sink = dialogRef.afterClosed().subscribe(result => {
      console.log('La modale d\'ajout s\'est fermée', result);
      // If result is received, it means the contract was successfully saved
      if (result) {
        // Optimistically add the new contract to the list OR
        // Re-fetch the entire list to ensure data consistency
         // this.contrats.push(result); // Option 1 (simple)
         this.loadContrats(); // Option 2 (safer)
      }
    });
  }

  // --- Modified method to open the Edit Contract dialog ---
  editContrat(contrat: Contrat): void {
    if (contrat.contractId) {
       const dialogRef = this.dialog.open(ContratFormComponent, {
         width: '800px', // Augmentation de la largeur
         maxWidth: '90vw', // Limite à 90% de la largeur de la fenêtre
         height: '80vh', // Hauteur fixe à 80% de la hauteur de la fenêtre
         maxHeight: '90vh', // Limite à 90% de la hauteur de la fenêtre
         panelClass: 'contrat-dialog-container', // Classe personnalisée pour le style
         disableClose: false, // Permet de fermer en cliquant à l'extérieur
         autoFocus: false, // Évite l'autofocus qui peut perturber le défilement
         data: contrat // Pass the contract object to the dialog for 'edit' mode
       });

       this.subs.sink = dialogRef.afterClosed().subscribe(result => {
         console.log('La modale de modification s\'est fermée', result);
         // If result is received, it means the contract was successfully updated
         if (result && result.contractId) {
            // Optimistically update the item in the list OR
            // Re-fetch the entire list
             const index = this.contrats.findIndex(c => c.contractId === result.contractId);
             if (index !== -1) {
               this.contrats[index] = result; // Option 1 (simple)
             }
            // Or safer:
            this.loadContrats(); // Option 2
         }
       });
    } else {
       console.error("Cannot edit contract without an ID", contrat);
       alert("Erreur: Impossible de modifier ce contrat (ID manquant).");
    }
  }

  deleteContrat(contrat: Contrat): void {
    // Existing delete logic remains
    if (confirm(`Êtes-vous sûr de vouloir supprimer le contrat Référence: ${contrat.reference}?`)) {
      if (contrat.contractId) {
         this.loading = true;
         this.subs.sink = this.contratService.deleteContrat(contrat.contractId).subscribe({
           next: () => {
             console.log('Contrat supprimé avec succès');
             this.contrats = this.contrats.filter(c => c.contractId !== contrat.contractId);
             this.loading = false;
             // Show success message
           },
           error: (error) => {
             console.error('Erreur lors de la suppression du contrat', error);
             this.loading = false;
             const errorMessage = error.error || 'Une erreur est survenue lors de la suppression.';
             alert('Erreur lors de la suppression: ' + errorMessage);
           }
         });
      } else {
        console.error("Cannot delete contract without an ID", contrat);
        alert("Erreur: Impossible de supprimer ce contrat (ID manquant).");
      }
    }
  }

  viewContratDetails(contrat: Contrat): void {
     if (contrat.contractId) {
       console.log('Viewing details for contract:', contrat.contractId);
        // this.router.navigate(['/admin/contrats/view-contrat', contrat.contractId]);
     } else {
        console.error("Cannot view details without a contract ID", contrat);
        alert("Erreur: Impossible d'afficher les détails de ce contrat (ID manquant).");
     }
  }

  // --- Corrected method to trigger PDF download ---
  downloadPdf(contrat: Contrat): void {
    // This check ensures both contractId is truthy AND fileName is truthy (i.e., a non-empty string, not null or undefined)
    if (contrat.contractId && contrat.fileName) {
      this.subs.sink = this.contratService.downloadContratPdf(contrat.contractId).subscribe({
        next: (blob: Blob) => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          // --- Type assertion added here ---
          a.download = contrat.fileName as string; // <--- ADDED 'as string'
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
          console.log('Téléchargement démarré pour:', contrat.fileName);
        },
        error: (error) => {
          console.error('Erreur lors du téléchargement du PDF', error);
          const errorMessage = error.status === 404 ? 'Fichier PDF non trouvé pour ce contrat.' : 'Une erreur est survenue lors du téléchargement du fichier.';
          alert('Erreur lors du téléchargement: ' + errorMessage);
        }
      });
    } else {
      console.warn('Impossible de télécharger le PDF: ID du contrat ou nom du fichier manquant.', contrat);
      alert('Aucun fichier PDF disponible pour ce contrat.');
    }
  }
  // --- End of corrected method ---
}