import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { MyTasks } from './my-tasks.model';

@Injectable({
  providedIn: 'root',
})
export class MyTasksService {
  private readonly API_URL = 'assets/data/my-tasks.json';

  constructor(private httpClient: HttpClient) {}

  /** GET: Fetch all tasks */
  getAllMyTasks(): Observable<MyTasks[]> {
    return this.httpClient
      .get<MyTasks[]>(this.API_URL)
      .pipe(catchError(this.handleError));
  }

  /** POST: Add a new task */
  addMyTasks(myTasks: MyTasks): Observable<MyTasks> {
    return this.httpClient.post<MyTasks>(this.API_URL, myTasks).pipe(
      map(() => {
        return myTasks; // Return the newly added task
      }),
      catchError(this.handleError)
    );
  }

  /** PUT: Update an existing task */
  updateMyTasks(myTasks: MyTasks): Observable<MyTasks> {
    return this.httpClient.put<MyTasks>(`${this.API_URL}`, myTasks).pipe(
      map(() => {
        return myTasks; // Return the updated task
      }),
      catchError(this.handleError)
    );
  }

  /** DELETE: Remove a task by ID */
  deleteMyTasks(id: number): Observable<number> {
    return this.httpClient.delete<void>(`${this.API_URL}`).pipe(
      map(() => {
        return id; // Return the ID of the deleted task
      }),
      catchError(this.handleError)
    );
  }

  /** Handle Http operation that failed */
  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('An error occurred:', error.message);
    return throwError(
      () => new Error('Something went wrong; please try again later.')
    );
  }
}
