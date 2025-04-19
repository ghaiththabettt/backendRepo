import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

// Interface correspondant à votre modèle JobPosition
export interface JobPosition {
  jobPositionId: number;
  title: string;
  jobLevel: string;
  description: string;
  // Ajoutez d'autres champs si nécessaire
}

@Injectable({
  providedIn: 'root'
})
export class JobPositionService {
  // URL de base pour l'endpoint des job positions
  private apiUrl = `${environment.apiUrl}/job-positions`;

  constructor(private http: HttpClient) { }

  // Récupérer tous les postes en utilisant l'endpoint "/allPosition"
  getAllJobPositions(): Observable<JobPosition[]> {
    const headers = { 'Accept': 'application/json' };
    return this.http.get<JobPosition[]>(`${this.apiUrl}/allPosition`, { headers });
  }

  // Récupérer un poste par son ID
  getJobPositionById(id: number): Observable<JobPosition> {
    return this.http.get<JobPosition>(`${this.apiUrl}/${id}`);
  }

  // Créer un nouveau poste
  createJobPosition(jobPosition: JobPosition): Observable<JobPosition> {
    return this.http.post<JobPosition>(this.apiUrl, jobPosition);
  }

  // Mettre à jour un poste existant
  updateJobPosition(id: number, jobPosition: JobPosition): Observable<JobPosition> {
    return this.http.put<JobPosition>(`${this.apiUrl}/${id}`, jobPosition);
  }

  // Supprimer un poste
  deleteJobPosition(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // (Optionnel) Récupérer les postes par titre via un paramètre de requête
  getJobPositionsByTitle(title: string): Observable<JobPosition[]> {
    return this.http.get<JobPosition[]>(`${this.apiUrl}/by-title?title=${encodeURIComponent(title)}`);
  }
}
