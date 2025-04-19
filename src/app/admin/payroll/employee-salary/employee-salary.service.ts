import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EmployeeSalary } from './employee-salary.model';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class EmployeeSalaryService {
  private apiUrl = 'http://localhost:8083/api/payrolls';

  constructor(private http: HttpClient) {}

  getAll(): Observable<EmployeeSalary[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      map((data) =>
        data.map((item) => ({
          payrollId: item.payrollId,
          employeeId: item.employeeId,
          employeeName: item.employeeName,
          employeeDepartment: item.employeeDepartment,
          basicSalary: item.baseSalary, // attention à baseSalary ici
          bonuses: item.bonuses,
          deductions: item.deductions,
          totalSalary: item.totalSalary,
          payDate: item.payDate
        }))
      )
    );
  }
  

  add(payload: EmployeeSalary): Observable<EmployeeSalary> {
    return this.http.post<EmployeeSalary>(this.apiUrl, payload);
  }

  update(payload: EmployeeSalary): Observable<EmployeeSalary> {
    return this.http.put<EmployeeSalary>(`${this.apiUrl}/${payload.payrollId}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}