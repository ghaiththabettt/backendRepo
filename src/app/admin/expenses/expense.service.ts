import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { Expense } from './expense.model';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ExpenseService {
  private baseUrl = 'http://localhost:8083/api/expenses';

  constructor(private http: HttpClient) {}

  getAllExpenses(): Observable<Expense[]> {
    return this.http.get<Expense[]>(this.baseUrl);
  }

  getExpenseById(expenseId: number): Observable<Expense> {
    return this.http.get<Expense>(`${this.baseUrl}/${expenseId}`);
  }

  addExpense(expense: Expense) {
    return this.http.post<Expense>(this.baseUrl, expense).pipe(
      catchError((error) => {
        console.error('Error adding expense:', error);
        return throwError(() => new Error('Error adding expense'));
      })
    );
  }

  updateExpense(id: number, expense: Expense) {
    return this.http.put<Expense>(`${this.baseUrl}/${id}`, expense).pipe(
      catchError((error) => {
        console.error('Error updating expense:', error);
        return throwError(() => new Error('Error updating expense'));
      })
    );
  }

  deleteExpense(expenseId: number) {
    return this.http.delete<void>(`${this.baseUrl}/${expenseId}`);
  }
}
