import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TrainerInfo , TrainingDTO} from './training-list.model';

@Injectable({
  providedIn: 'root'
})
export class TrainingListService {
  private readonly API_URL = 'http://localhost:8083/api/trainings';

  constructor(private http: HttpClient) {}

  // Récupérer tous les trainers avec leurs trainings
  getAllTrainersWithTrainings(): Observable<TrainerInfo[]> {
    return this.http.get<TrainerInfo[]>(`${this.API_URL}/with-participants`);
  }

  // Récupérer la liste des trainings disponibles
  getAllTrainings(): Observable<TrainingDTO[]> {
    return this.http.get<TrainingDTO[]>(`${this.API_URL}`);
  }

  // Modifier le training d’un employé
  updateEmployeeTraining(email: string, trainingId: number): Observable<any> {
    return this.http.put(`${this.API_URL}/update-training`, { email, trainingId });
  }

  // Supprimer un employé d’un training
  removeEmployeeFromTraining(email: string): Observable<any> {
    return this.http.put(`${this.API_URL}/remove-training`, { email });
  }
}
