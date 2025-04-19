import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { ExpenseReport } from './expense-report.model';

@Injectable({
  providedIn: 'root',
})
export class ExpenseReportService {
  private readonly API_URL = 'assets/data/expense-report.json';

  constructor(private httpClient: HttpClient) {}

  /** GET: Fetch all expense reports */
  getAllExpenseReports(): Observable<ExpenseReport[]> {
    return this.httpClient
      .get<ExpenseReport[]>(this.API_URL)
      .pipe(catchError(this.handleError));
  }

  /** POST: Add a new expense report */
  addExpenseReport(expenseReport: ExpenseReport): Observable<ExpenseReport> {
    return this.httpClient
      .post<ExpenseReport>(this.API_URL, expenseReport)
      .pipe(
        map(() => {
          return expenseReport; // return the newly added expense report
        }),
        catchError(this.handleError)
      );
  }

  /** PUT: Update an existing expense report */
  updateExpenseReport(expenseReport: ExpenseReport): Observable<ExpenseReport> {
    return this.httpClient.put<ExpenseReport>(this.API_URL, expenseReport).pipe(
      map(() => {
        return expenseReport; // return the updated expense report
      }),
      catchError(this.handleError)
    );
  }

  /** DELETE: Remove an expense report by ID */
  deleteExpenseReport(id: number): Observable<number> {
    return this.httpClient.delete<void>(`${this.API_URL}`).pipe(
      map(() => {
        return id; // return the ID of the deleted expense report
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
