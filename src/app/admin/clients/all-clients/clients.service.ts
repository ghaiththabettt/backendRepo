import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Clients } from './clients.model';

@Injectable({
  providedIn: 'root',
})
export class ClientsService {
  private readonly API_URL = 'assets/data/clients.json';

  constructor(private httpClient: HttpClient) {}

  /** GET: Fetch all clients */
  getAllClients(): Observable<Clients[]> {
    return this.httpClient
      .get<Clients[]>(this.API_URL)
      .pipe(catchError(this.handleError));
  }

  /** POST: Add a new client */
  addClient(client: Clients): Observable<Clients> {
    return this.httpClient.post<Clients>(this.API_URL, client).pipe(
      map(() => {
        return client; // Return the newly added client
      }),
      catchError(this.handleError)
    );
  }

  /** PUT: Update an existing client */
  updateClient(client: Clients): Observable<Clients> {
    return this.httpClient.put<Clients>(`${this.API_URL}`, client).pipe(
      map(() => {
        return client; // Return the updated client
      }),
      catchError(this.handleError)
    );
  }

  /** DELETE: Remove a client by ID */
  deleteClient(id: number): Observable<number> {
    return this.httpClient.delete<void>(`${this.API_URL}`).pipe(
      map(() => {
        return id; // Return the ID of the deleted client
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
