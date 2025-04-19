import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, map } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Leads } from './leads.model';

@Injectable({
  providedIn: 'root',
})
export class LeadsService {
  private readonly API_URL = 'assets/data/leads.json';

  constructor(private httpClient: HttpClient) {}

  /** GET: Fetch all leads */
  getAllLeads(): Observable<Leads[]> {
    return this.httpClient
      .get<Leads[]>(this.API_URL)
      .pipe(catchError(this.handleError));
  }

  /** POST: Add a new lead */
  addLeads(leads: Leads): Observable<Leads> {
    return this.httpClient.post<Leads>(this.API_URL, leads).pipe(
      map(() => {
        return leads; // Return the newly added lead
      }),
      catchError(this.handleError)
    );
  }

  /** PUT: Update an existing lead */
  updateLeads(leads: Leads): Observable<Leads> {
    return this.httpClient
      .put<Leads>(`${this.API_URL}`, leads) // Ensure to use the correct endpoint as per your API
      .pipe(
        map(() => {
          return leads; // Return the updated lead
        }),
        catchError(this.handleError)
      );
  }

  /** DELETE: Remove a lead by ID */
  deleteLeads(id: number): Observable<number> {
    return this.httpClient.delete<void>(`${this.API_URL}`).pipe(
      map(() => {
        return id; // Return the ID of the deleted lead
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
