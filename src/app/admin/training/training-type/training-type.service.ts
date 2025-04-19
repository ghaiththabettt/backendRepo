import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { TrainingType } from './training-type.model';

@Injectable({
  providedIn: 'root',
})
export class TrainingTypeService {
  private readonly API_URL = 'assets/data/training-types.json';
  dataChange: BehaviorSubject<TrainingType[]> = new BehaviorSubject<
    TrainingType[]
  >([]);

  constructor(private httpClient: HttpClient) {}

  /** GET: Fetch training types */
  getTrainingTypes(): Observable<TrainingType[]> {
    return this.httpClient
      .get<TrainingType[]>(this.API_URL)
      .pipe(catchError(this.handleError));
  }

  /** POST: Add a new training type */
  addTrainingType(trainingType: TrainingType): Observable<TrainingType> {
    return this.httpClient.post<TrainingType>(this.API_URL, trainingType).pipe(
      map((response) => {
        return trainingType; // return training type from API
      }),
      catchError(this.handleError)
    );
  }

  /** PUT: Update an existing training type */
  updateTrainingType(trainingType: TrainingType): Observable<TrainingType> {
    return this.httpClient
      .put<TrainingType>(`${this.API_URL}`, trainingType)
      .pipe(
        map((response) => {
          return trainingType; // return training type from API
        }),
        catchError(this.handleError)
      );
  }

  /** DELETE: Remove a training type by ID */
  deleteTrainingType(id: number): Observable<number> {
    return this.httpClient.delete<void>(`${this.API_URL}`).pipe(
      map(() => {
        return id; // return the ID of the deleted training type
      }),
      catchError(this.handleError)
    );
  }

  /** Handle Http operation that failed */
  private handleError(error: HttpErrorResponse) {
    console.error('An error occurred:', error.message);
    return throwError(
      () => new Error('Something went wrong; please try again later.')
    );
  }
}
