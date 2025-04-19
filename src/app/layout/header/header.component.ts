import { Component, OnInit, OnDestroy, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FeatherIconsComponent } from '../../shared/components/feather-icons/feather-icons.component'; // Adaptez chemin
import { MatTooltipModule } from '@angular/material/tooltip'; // *** AJOUT pour matTooltip ***
import { NgScrollbarModule } from 'ngx-scrollbar';
import { Subscription } from 'rxjs';

// Import des nouveaux services et modèles
import { TimerService } from '../../services/timer.service'; // Adaptez chemin
import { EntreeDeTempsService } from '../../services/entree-de-temps.service'; // Adaptez chemin
import { StartPointageRequest } from 'app/models/requests/start-pointage.request'; // Adaptez chemin
import { PauseRequest } from 'app/models/requests/pause.request';
import { ReprendreRequest } from 'app/models/requests/reprendre.request';
import { StopPointageRequest } from 'app/models/requests/stop-pointage.request';
import { TypePause } from 'app/models/type-pause.enum'; // Adaptez chemin
import { Employee } from 'models/employee.model'; // Adaptez chemin
import { AuthService } from '../../core/service/auth.service';
import { FormsModule } from '@angular/forms';
import { RestrictionsHorloge } from 'app/models/restrictions-horloge.enum'; // AJOUT
import { PointageLocationDto } from 'app/models/pointage-location.dto';   // AJOUT
import { TypeEntreeDeTemps } from 'app/models/type-entree-de-temps.enum';
interface LanguageOption {
  text: string;
  flag: string;
  lang: string;
}


interface NotificationItem {
  message: string;
  time: string;
  icon: string;
  color: string;
  status: string;
}

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatMenuModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule, // *** AJOUT ***
    FeatherIconsComponent,
    NgScrollbarModule,
    FormsModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent implements OnInit, OnDestroy {
  // --- Propriétés existantes ---
  isNavbarCollapsed = true;
  flagvalue: string | undefined;
  countryName: string | undefined;
  langStoreValue: string | undefined;
  defaultFlag: string | undefined;
  homePage = '/admin/dashboard/main';
  userImg = 'assets/images/user/admin.jpg';
  currentUser: Employee | null = null; // Type User qui a firstName/lastName
  notifications: NotificationItem[] = [];
  isStartFormVisible = false;
  selectedStartType: TypeEntreeDeTemps = TypeEntreeDeTemps.Travail; // Type par défaut
  startNote: string = '';
  // Pour le select du formulaire
  EntreeTypes = Object.values(TypeEntreeDeTemps);
  entreeTypeLabels: { [key in TypeEntreeDeTemps]: string } = {
    [TypeEntreeDeTemps.Travail]: 'Travail Normal',
    [TypeEntreeDeTemps.Heures_Supplementaires]: 'Heures Supplémentaires'
  };
  listLang: LanguageOption[] = [
    { text: 'English', flag: 'assets/images/flags/us.jpg', lang: 'en' },
    { text: 'French', flag: 'assets/images/flags/french.jpg', lang: 'fr' }
    // Ajoutez d'autres langues ici si nécessaire
  ];
  // --- Propriétés pour le pointage ---
  // Retrait de isTracking / isPaused locaux, on utilise le service direct dans le template
  timerDisplay = '00:00:00';
  currentPointageId: number | null = null;
  isPauseFormVisible = false;
  selectedPauseType: TypePause | null = null; // Stocke le type de pause sélectionné
  pauseNote: string = '';                    // Stocke la note de pause
  // Exposer l'enum TypePause au template (via une méthode ou une propriété)
  PauseTypes = Object.values(TypePause); // Tableau des valeurs de l'enum
  // Pour un affichage plus user-friendly des options dans le select
  pauseTypeLabels: { [key in TypePause]?: string } = {
    [TypePause.Pause_dejeuner]: 'Déjeuner',
    [TypePause.Pause_personnelle]: 'Pause Personnelle',
    [TypePause.Reunion]: 'Réunion',
    [TypePause.Autre]: 'Autre'
    // On peut exclure 'Aucune' car on ne choisit pas de ne pas prendre de pause
  };
  currentRestrictionMode: RestrictionsHorloge | null = null;
  // NOUVEAU: Gérer l'état pendant la recherche de localisation
  isFetchingLocation = false;
  // Pour stocker le mode de la session active
  currentSessionMode: RestrictionsHorloge | null = null;

  private timerSubs: Subscription[] = [];

  constructor(
    public authService: AuthService, // public pour accès facile dans le template
    private router: Router,
    public timerService: TimerService, // *** public pour accès facile dans le template ***
    private entreeDeTempsService: EntreeDeTempsService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    // Récupérer l'utilisateur connecté
    this.authService.currentUser.subscribe(user => {
        this.currentUser = user;
        this.userImg = user?.img || 'assets/images/user/admin.jpg';
        this.cdr.markForCheck();
    });

    // Abonnements pour mettre à jour timerDisplay et currentPointageId (requis pour [disabled])
    const elapsedSub = this.timerService.secondsElapsed$.subscribe(value => {
      this.timerDisplay = this.formatTime(value);
      this.cdr.markForCheck();
    });
    const pointageIdSub = this.timerService.currentPointageId$.subscribe(id => {
      this.currentPointageId = id;
      console.log("HeaderComponent: currentPointageId mis à jour ->", this.currentPointageId);
      // Pas besoin de cdr.markForCheck() ici car 'currentPointageId' est seulement utilisé pour [disabled]
      // et Angular devrait gérer cela. Si les boutons restent désactivés à tort, décommentez la ligne :
      // this.cdr.markForCheck();
    });

    this.timerSubs.push(elapsedSub, pointageIdSub);

    // Config langue...
    this.langStoreValue = localStorage.getItem('lang') || 'en';
    const val = this.listLang.find((x) => x.lang === this.langStoreValue);
    this.countryName = val?.text;
    this.flagvalue = val?.flag;
    this.defaultFlag = val?.flag;


    const modeSub = this.timerService.currentSessionMode$.subscribe(mode => {
      this.currentSessionMode = mode;
      this.cdr.markForCheck(); // Si l'UI dépend directement de currentSessionMode
  });
  this.timerSubs.push(modeSub);
  }

  ngOnDestroy() {
    this.timerSubs.forEach(sub => sub.unsubscribe());
  }

   // === NOUVELLE méthode : Géocodage inversé via Nominatim ===
   private async reverseGeocode(lat: number, lng: number): Promise<string | undefined> {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&accept-language=fr`;
    try {
      const response = await fetch(url);
      if (!response.ok) {
        console.error(`Erreur Nominatim: ${response.statusText}`);
        return undefined;
      }
      const data = await response.json();
      return data?.display_name; // Retourne le nom complet de l'adresse
    } catch (error) {
      console.error("Erreur lors du géocodage inversé:", error);
      return undefined;
    }
  }
  cancelStartForm() {
    console.log("Annulation formulaire démarrage");
    this.isStartFormVisible = false;
    this.isFetchingLocation = false; // S'assurer que l'indicateur est reset
    this.cdr.markForCheck();
}

  // === NOUVELLE méthode : Récupérer la localisation actuelle ===
  private getCurrentLocation(): Promise<PointageLocationDto | null> {
    console.log("Demande de localisation...");
    this.isFetchingLocation = true;
    this.cdr.markForCheck();

    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        console.error("La géolocalisation n'est pas supportée.");
        alert("La géolocalisation n'est pas supportée par votre navigateur.");
        this.isFetchingLocation = false;
        this.cdr.markForCheck();
        resolve(null); // Résout avec null si non supporté
        return;
      }

      navigator.geolocation.getCurrentPosition(
        // Success Callback
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          console.log(`Localisation obtenue: lat=${lat}, lng=${lng}`);

          // Essayer d'obtenir l'adresse
          const adresse = await this.reverseGeocode(lat, lng);
          console.log(`Adresse obtenue: ${adresse || 'Non trouvée'}`);

          this.isFetchingLocation = false;
          this.cdr.markForCheck();
          resolve({ lat, lng, adresseComplete: adresse }); // Résout avec les données
        },
        // Error Callback
        (error) => {
          console.error("Erreur de géolocalisation:", error);
          let message = "Impossible d'obtenir la localisation.";
          switch(error.code) {
              case error.PERMISSION_DENIED:
                  message = "Vous avez refusé l'accès à la localisation.";
                  break;
              case error.POSITION_UNAVAILABLE:
                  message = "L'information de localisation n'est pas disponible.";
                  break;
              case error.TIMEOUT:
                  message = "La demande de localisation a expiré.";
                  break;
              default: //UNKNOWN_ERROR ou autre
                  message = "Une erreur inconnue est survenue lors de la localisation.";
          }
          alert(message); // Informe l'utilisateur
          this.isFetchingLocation = false;
          this.cdr.markForCheck();
          resolve(null); // Résout avec null en cas d'erreur
        },
        // Options
        {
          enableHighAccuracy: true, // Plus précis si possible
          timeout: 15000, // Temps max d'attente (15s)
          maximumAge: 0 // Forcer une position fraîche
        }
      );
    });
  }

  // --- Méthodes Pointage (startPointage, pausePointage, etc. comme avant) ---
  startPointage() {
    // Réinitialiser les champs du formulaire avant d'ouvrir
    this.selectedStartType = TypeEntreeDeTemps.Travail; // Reset au défaut
    this.startNote = '';
    this.isStartFormVisible = true;
    this.cdr.markForCheck();
    console.log("Ouverture formulaire de démarrage.");
}

// === NOUVEAU: Confirm Start (appelé par le formulaire) - devient async ===
async confirmStart() {
    if (!this.currentUser || !this.currentUser.id) {
        console.error("Utilisateur non connecté ou ID manquant.");
        alert("Erreur interne : Utilisateur non identifié.");
        this.cancelStartForm(); // Fermer le formulaire
        return;
    }
    if (this.isFetchingLocation) return; // Protection double clic

    console.log("Confirmation démarrage pointage avec type:", this.selectedStartType, "Note:", this.startNote);
    this.isStartFormVisible = false; // Cacher le formulaire immédiatement

    // 1. Récupérer le mode de restriction (logique comme avant)
    try {
        const modeResponse = await this.entreeDeTempsService.getDernierMode().toPromise();
        this.currentRestrictionMode = modeResponse?.restrictionsHorloge || RestrictionsHorloge.Flexible;
    } catch (err) {
        console.error("Erreur récupération mode:", err);
        this.currentRestrictionMode = RestrictionsHorloge.Flexible;
        alert("Impossible de vérifier le mode, utilisation du mode Flexible.");
    }

    // 2. Gérer la localisation (logique comme avant)
    let locationData: PointageLocationDto | null = null;
    if (this.currentRestrictionMode === RestrictionsHorloge.Strict) {
        locationData = await this.getCurrentLocation();
        if (!locationData) {
            console.log("Démarrage annulé (confirm): Localisation Strict requise non obtenue.");
            return; // Alert gérée dans getCurrentLocation
        }
    } else {
        locationData = await this.getCurrentLocation();
    }

    // 3. Construire et envoyer la requête AVEC les infos du formulaire
    const request: StartPointageRequest = {
        employeeId: this.currentUser.id,
        typeEntreeDeTemps: this.selectedStartType, // Utiliser le type sélectionné
        notes: this.startNote.trim(),             // Utiliser la note saisie
        localisationDebut: locationData ? locationData : undefined
    };

    console.log("Envoi requête /commencer:", request);
    this.entreeDeTempsService.commencer(request).subscribe({
        next: (response) => {
            if (response.success && response.data?.id && response.data.restrictionsHorloge) {
               this.timerService.startTimer(response.data.id, response.data.restrictionsHorloge);
               // Reset form fields after successful start? Optional.
               // this.startNote = '';
               // this.selectedStartType = TypeEntreeDeTemps.Travail;
            } else {
               console.error(response.message); alert(`Erreur: ${response.message}`);
            }
         },
        error: (err) => { console.error(err); alert(`Erreur HTTP: ${err.error?.message || err.message}`); }
    });
}


   // MODIFIÉ: Ouvre le formulaire au lieu d'appeler directement le service
   pausePointage() {
    if (!this.currentPointageId) {
        console.warn("Pointage ID non défini, ne peut pas ouvrir le formulaire de pause.");
        return; // S'assurer qu'un pointage est bien actif
    }
    console.log("Ouverture formulaire pause");
    this.selectedPauseType = null; // Réinitialiser la sélection
    this.pauseNote = '';         // Réinitialiser la note
    this.isPauseFormVisible = true;
    this.cdr.markForCheck(); // Nécessaire si on cache/affiche un bloc avec OnPush
  }

  // NOUVEAU: Appelée par le bouton "Valider" du formulaire de pause
  confirmPause() {
    if (!this.currentPointageId || this.selectedPauseType === null) {
      alert("Veuillez sélectionner un type de pause.");
      return; // Ne rien faire si invalide
    }

    const request: PauseRequest = {
      pointageId: this.currentPointageId,
      typePause: this.selectedPauseType,
      note: this.pauseNote.trim() // Enlever les espaces superflus
    };

    console.log("Validation Pause - Envoi requête /pause:", request);
    this.entreeDeTempsService.mettreEnPause(request).subscribe({
      next: (response) => {
        if (response.success) {
          this.timerService.pauseTimer(); // Mettre en pause le timer local
          this.isPauseFormVisible = false; // Cacher le formulaire
          this.cdr.markForCheck(); // Mettre à jour l'UI
          console.log("Pause confirmée");
        } else {
          console.error("Erreur validation pause (API):", response.message);
          alert(`Erreur: ${response.message}`);
        }
      },
      error: (err) => {
        console.error("Erreur validation pause (HTTP):", err);
        alert(`Erreur HTTP: ${err.error?.message || err.message}`);
        // On laisse le formulaire ouvert en cas d'erreur pour que l'utilisateur puisse réessayer ?
      }
    });
  }
  getValidPauseTypes(): TypePause[] {
    // Exclut 'Aucune' s'il existe dans l'enum
    return this.PauseTypes.filter(type => type !== TypePause.Aucune);
}
  // NOUVEAU: Appelée par le bouton "Annuler" du formulaire de pause
  cancelPauseForm() {
    console.log("Annulation formulaire pause");
    this.isPauseFormVisible = false;
    this.cdr.markForCheck();
  }


  resumePointage() {
      if (!this.currentPointageId) return;
      const request: ReprendreRequest = { pointageId: this.currentPointageId };
      this.entreeDeTempsService.reprendre(request).subscribe({
        next: (response) => {
          if (response.success) { this.timerService.resumeTimer(); }
           else { console.error(response.message); alert(`Erreur: ${response.message}`); }
        },
        error: (err) => { console.error(err); alert(`Erreur HTTP: ${err.error?.message || err.message}`);}
      });
    }

  stopPointage() {
      if (!this.currentPointageId) return;
      const request: StopPointageRequest = { pointageId: this.currentPointageId, gpsValide: true };
      this.entreeDeTempsService.arreterPointage(request).subscribe({
        next: (response) => {
          if (response.success) { this.timerService.stopTimer(); }
          else { console.error(response.message); alert(`Erreur: ${response.message}`); }
        },
        error: (err) => { console.error(err); alert(`Erreur HTTP: ${err.error?.message || err.message}`);}
      });
    }

  // --- Méthodes utilitaires et existantes (formatTime, toggleSidebar, callFullscreen, setLanguage, logout) ---
  private formatTime(totalSec: number): string { /* ... comme avant ... */
    if (isNaN(totalSec) || totalSec < 0) return '00:00:00';
    const hours = Math.floor(totalSec / 3600).toString().padStart(2, '0');
    const minutes = Math.floor((totalSec % 3600) / 60).toString().padStart(2, '0');
    const seconds = (totalSec % 60).toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  }
  toggleSidebar() { /* ... comme avant ... */
     const sidebar = document.querySelector('.sidebar') || document.querySelector('app-sidebar > .sidebar');
     sidebar?.classList.toggle('close_sidebar');
   }
  callFullscreen() { /* ... comme avant ... */
    const elem = document.documentElement;
    if (!document.fullscreenElement) {
      if (elem.requestFullscreen) { elem.requestFullscreen(); }
    } else {
      if (document.exitFullscreen) { document.exitFullscreen(); }
    }
  }
  setLanguage(text: string, lang: string, flag: string) { /* ... comme avant ... */
    this.countryName = text;
    this.flagvalue = flag;
    this.langStoreValue = lang;
    localStorage.setItem('lang', lang);
  }
  logout() { /* ... comme avant ... */
    this.timerService.stopTimer();
    this.authService.logout().subscribe(() => {
      this.router.navigate(['/authentication/signin']);
    });
  }
}