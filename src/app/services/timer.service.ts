// core/service/timer.service.ts (adaptez le chemin)
import { Injectable } from '@angular/core';
import { RestrictionsHorloge } from 'app/models/restrictions-horloge.enum';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TimerService {
  private intervalId: any;
  private seconds = 0;
  private tracking = false;
  private paused = false;

  // --- TYPE CORRIGÉ ---
  private currentPointageId: number | null = null;
  private currentSessionMode: RestrictionsHorloge | null = null;

  secondsElapsed$ = new BehaviorSubject<number>(0);
  isTracking$ = new BehaviorSubject<boolean>(false);
  isPaused$ = new BehaviorSubject<boolean>(false);
  // --- TYPE CORRIGÉ ---
  currentPointageId$ = new BehaviorSubject<number | null>(null);
  currentSessionMode$ = new BehaviorSubject<RestrictionsHorloge | null>(null);

  constructor() {
    // Vider l'état au démarrage pour s'assurer de ne pas reprendre un état invalide après rechargement complet ?
    // Ou garder la restauration, mais avec une logique plus robuste peut-être côté composant pour vérifier
    // si un pointage est VRAIMENT actif sur le serveur au démarrage.
    // Pour l'instant, gardons la restauration pour maintenir l'ancien comportement.
    this.restoreStateFromLocalStorage();
  }

  private restoreStateFromLocalStorage() {
    const saved = localStorage.getItem('timerState');
    if (saved) {
      try {
        const state = JSON.parse(saved);
        console.log("TimerService: État restauré :", state);

        // Simplification: On se base sur le currentPointageId sauvegardé.
        // Si un ID est sauvegardé et qu'on était en cours ou en pause,
        // le composant devra revérifier l'état réel au serveur si nécessaire.
        if (state.currentPointageId && (state.tracking || state.paused)) {
            const { seconds, tracking, paused, currentPointageId,currentSessionMode  } = state;
            this.seconds = seconds || 0;
            this.tracking = !!tracking; // Est actif ?
            this.paused = !!paused;     // Était en pause ?
            this.currentPointageId = currentPointageId ? Number(currentPointageId) : null; // Assurer conversion en number
            this.currentSessionMode = currentSessionMode || null; // Restaurer

            this.secondsElapsed$.next(this.seconds);
            this.isTracking$.next(this.tracking);
            this.isPaused$.next(this.paused);
            this.currentPointageId$.next(this.currentPointageId);

            // Relancer le compteur seulement si on était actif ET non en pause
            if (this.tracking && !this.paused) {
                this.startInterval();
            }
        } else {
          // Si pas d'ID ou pas en tracking, on réinitialise
          this.stopTimerLocally(); // Appelle stopTimer mais sans effacer localStorage (fait par stopTimer)
        }

      } catch (e) {
        console.warn('TimerService: Impossible de parser timerState :', e);
        this.clearState(); // Nettoyer en cas d'erreur de parsing
      }
    } else {
        this.initializeState(); // Initialiser si rien n'est sauvegardé
    }
  }


  private startInterval() {
    this.stopInterval(); // Arrêter l'ancien intervalle s'il existe
    this.intervalId = setInterval(() => {
      this.seconds++;
      this.secondsElapsed$.next(this.seconds);
      this.saveState(); // Sauvegarder à chaque seconde
    }, 1000);
  }

  private stopInterval() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private saveState() {
    const state = {
      seconds: this.seconds,
      tracking: this.tracking,
      paused: this.paused,
      currentPointageId: this.currentPointageId,  
      currentSessionMode: this.currentSessionMode

    };
    localStorage.setItem('timerState', JSON.stringify(state));
  }

   private clearState() {
        localStorage.removeItem('timerState');
        this.initializeState(); // Réinitialise les observables
   }

   private initializeState() {
        this.stopInterval();
        this.tracking = false;
        this.paused = false;
        this.seconds = 0;
        this.currentPointageId = null;
        this.isTracking$.next(false);
        this.isPaused$.next(false);
        this.secondsElapsed$.next(0);
        this.currentPointageId$.next(null);
   }

  // Appelé quand un pointage COMMENCE réellement (après succès backend)
  // --- TYPE CORRIGÉ pour le paramètre ---
  startTimer(pointageId: number, mode: RestrictionsHorloge) {
    console.log("TimerService: startTimer avec ID:", pointageId, "et Mode:", mode);
    this.tracking = true;
    this.paused = false;
    this.seconds = 0;
    this.currentPointageId = pointageId;
    this.currentSessionMode = mode; // <<< Stocker le mode reçu
    this.isTracking$.next(true);
    this.isPaused$.next(false);
    this.secondsElapsed$.next(0);
    this.currentPointageId$.next(this.currentPointageId);
    this.currentSessionMode$.next(this.currentSessionMode); // <<< Emettre le mode reçu
    this.startInterval();
    this.saveState(); // Sauvegarde l'état incluant le mode
  }


  // Appelé quand une PAUSE démarre (après succès backend)
  pauseTimer() {
    console.log("TimerService: pauseTimer");
    this.stopInterval();
    // Garde tracking=true, mais met paused=true
    if (this.tracking) { // Ne met en pause que si on suivait le temps
      this.paused = true;
      this.isPaused$.next(true);
      this.saveState(); // Sauvegarder l'état de pause
    }
  }

  // Appelé quand une PAUSE se termine (après succès backend)
  resumeTimer() {
    console.log("TimerService: resumeTimer");
    if (this.tracking && this.paused) { // Ne reprend que si on suivait et qu'on était en pause
      this.paused = false;
      this.isPaused$.next(false);
      this.startInterval(); // Redémarre le compteur
      this.saveState(); // Sauvegarde l'état de reprise
    }
  }

  // Appelé quand un pointage s'ARRÊTE (après succès backend)
  stopTimer() {
     console.log("TimerService: stopTimer (arrêt complet)");
     this.clearState(); // Efface localStorage et réinitialise l'état interne
  }

  // Méthode interne pour réinitialiser l'état sans effacer le localStorage,
  // utile lors de la restauration si l'état sauvegardé n'est plus valide.
   private stopTimerLocally() {
        this.stopInterval();
        this.tracking = false;
        this.paused = false;
        this.seconds = 0;
        this.currentPointageId = null;
        this.isTracking$.next(false);
        this.isPaused$.next(false);
        this.secondsElapsed$.next(0);
        this.currentPointageId$.next(null);
        this.currentSessionMode$.next(null); // Reset
      }

  // --- TYPE CORRIGÉ ---
  getCurrentPointageId(): number | null {
    return this.currentPointageId;
  }
  
}