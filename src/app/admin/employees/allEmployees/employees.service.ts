import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { Employees } from './employees.model';

@Injectable({
  providedIn: 'root',
})
export class EmployeesService {
  private readonly API_URL = 'assets/data/employees.json';
  constructor(private httpClient: HttpClient) {}

  /** GET: Fetch all employees */
  getAllEmployees(): Observable<Employees[]> {
    return this.httpClient
      .get<Employees[]>(this.API_URL)
      .pipe(catchError(this.handleError));
  }

  /** POST: Add a new employee */
  addEmployee(employee: Employees): Observable<Employees> {
    return this.httpClient.post<Employees>(this.API_URL, employee).pipe(
      map(() => {
        return employee; // return the newly added employee
      }),
      catchError(this.handleError)
    );
  }

  /** PUT: Update an existing employee */
  updateEmployee(employee: Employees): Observable<Employees> {
    return this.httpClient.put<Employees>(`${this.API_URL}`, employee).pipe(
      map(() => {
        return employee; // return the updated employee
      }),
      catchError(this.handleError)
    );
  }

  /** DELETE: Remove an employee by ID */
  deleteEmployee(id: number): Observable<number> {
    return this.httpClient.delete<void>(`${this.API_URL}`).pipe(
      map(() => {
        return id; // return the ID of the deleted employee
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
