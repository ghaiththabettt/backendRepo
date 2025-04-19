// core/service/entree-de-temps.service.ts (adaptez le chemin)
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'environments/environment'; // Assurez-vous que le chemin est correct
import { AuthService } from '../core/service/auth.service'; // Assurez-vous que le chemin est correct

// Importer les DTOs et Interfaces créés à l'étape 1
import { StartPointageRequest } from 'app/models/requests/start-pointage.request'; // Adaptez le chemin
import { PauseRequest } from 'app/models/requests/pause.request';
import { ReprendreRequest } from 'app/models/requests/reprendre.request';
import { StopPointageRequest } from 'app/models/requests/stop-pointage.request';
import { EntreeDeTempsDTO } from 'app/models/entree-de-temps.dto';
import { AnalyseTempsResponseDto } from 'app/models/responses/analyse-temps-response.dto';
import { DernierModeResponseDto } from 'app/models/responses/dernier-mode-response.dto';
import { ApiResponse } from 'app/models/responses/api-response';
import { MessageResponse } from 'app/models/message-response';



@Injectable({
  providedIn: 'root'
})
export class EntreeDeTempsService {
  // Utilisez l'URL de base de l'environnement + le chemin de l'API Spring Boot
  private apiUrl = `${environment.apiUrl}/entreesDeTemps`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  // Pas besoin de getAuthHeaders ici, l'intercepteur s'en occupe.

  // Démarrer un pointage
  commencer(request: StartPointageRequest): Observable<ApiResponse<EntreeDeTempsDTO>> {
    return this.http.post<ApiResponse<EntreeDeTempsDTO>>(`${this.apiUrl}/commencer`, request);
  }

  // Mettre en pause un pointage
  mettreEnPause(request: PauseRequest): Observable<ApiResponse<EntreeDeTempsDTO>> {
    return this.http.post<ApiResponse<EntreeDeTempsDTO>>(`${this.apiUrl}/pause`, request);
  }

  // Reprendre après une pause
  reprendre(request: ReprendreRequest): Observable<ApiResponse<EntreeDeTempsDTO>> {
    return this.http.post<ApiResponse<EntreeDeTempsDTO>>(`${this.apiUrl}/reprendre`, request);
  }

  // Arrêter un pointage
  arreterPointage(request: StopPointageRequest): Observable<ApiResponse<EntreeDeTempsDTO>> {
    return this.http.post<ApiResponse<EntreeDeTempsDTO>>(`${this.apiUrl}/arreter`, request);
  }

  // Obtenir le dernier mode utilisé
  getDernierMode(): Observable<DernierModeResponseDto> {
    // Le backend retourne directement l'objet { restrictionsHorloge: ... }, pas dans ApiResponse
    return this.http.get<DernierModeResponseDto>(`${this.apiUrl}/dernierMode`);
  }

  // Analyser le temps d'un utilisateur (l'ID est un nombre)
  analyserTempsUtilisateur(employeeId: number, startDate?: string, endDate?: string): Observable<ApiResponse<AnalyseTempsResponseDto>> {
    let params = new HttpParams();
    if (startDate) { params = params.set('startDate', startDate); } // Format YYYY-MM-DD
    if (endDate) { params = params.set('endDate', endDate); }     // Format YYYY-MM-DD
    return this.http.get<ApiResponse<AnalyseTempsResponseDto>>(`${this.apiUrl}/analyser/${employeeId}`, { params });
  }

   // --- Endpoints Admin/RH (Adaptez les DTOs si vous créez ModifierDatesRequest) ---

   // Obtenir tous les pointages (Admin/RH/Responsable)
   getAllPointages(): Observable<ApiResponse<EntreeDeTempsDTO[]>> {
       return this.http.get<ApiResponse<EntreeDeTempsDTO[]>>(`${this.apiUrl}/all`);
   }

   // Modifier les dates d'un pointage (Admin/RH) - Nécessite un DTO ModifierDatesRequest
   /*
   modifierDatesPointage(request: ModifierDatesRequest): Observable<ApiResponse<EntreeDeTempsDTO>> {
       return this.http.put<ApiResponse<EntreeDeTempsDTO>>(`${this.apiUrl}/modifier-dates`, request);
   }
   */

   // Supprimer tous les pointages (Admin/RH)
   deleteAllPointages(): Observable<MessageResponse> {
       // Le backend retourne directement { message: ... }, pas ApiResponse
       return this.http.delete<MessageResponse>(`${this.apiUrl}/deleteAll`);
   }

    // --- Endpoint pour Tâches (si réintégré) ---
   /*
   getTachesPourFormulaire(): Observable<ApiResponse<TacheSimpleDto[]>> {
       return this.http.get<ApiResponse<TacheSimpleDto[]>>(`${this.apiUrl}/taches`);
   }
   */

}