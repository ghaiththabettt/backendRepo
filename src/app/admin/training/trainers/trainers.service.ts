import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Trainers } from './trainers.model';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class TrainersService {
  private readonly API_URL = 'http://localhost:8083/api/trainings';

  constructor(private httpClient: HttpClient) {}

  getTrainers(): Observable<Trainers[]> {
    return this.httpClient.get<Trainers[]>(this.API_URL).pipe(
      catchError(this.handleError)
    );
  }

  getTrainerById(id: number): Observable<Trainers> {
    return this.httpClient.get<Trainers>(`${this.API_URL}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  addTrainer(trainer: Trainers): Observable<Trainers> {
    return this.httpClient.post<Trainers>(this.API_URL, trainer).pipe(
      catchError(this.handleError)
    );
  }

  updateTrainer(trainer: Trainers): Observable<Trainers> {
    return this.httpClient.put<Trainers>(
      `${this.API_URL}/${trainer.trainingId}`,
      trainer
    ).pipe(
      catchError(this.handleError)
    );
  }

  deleteTrainer(id: number): Observable<void> {
    return this.httpClient.delete<void>(`${this.API_URL}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    console.error('An error occurred:', error.message);
    return throwError(() => new Error('Something went wrong; please try again later.'));
  }

  getParticipantsByTrainingId(trainingId: number): Observable<any[]> {
    return this.httpClient.get<any[]>(`http://localhost:808/api/trainings/${trainingId}/participants`);
  }
  
}
