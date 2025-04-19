import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Employee } from 'app/admin/departments/all-departments/department.model'; // Créez ce modèle si nécessaire

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private baseUrl = 'http://localhost:8083/api/employee';
  constructor(private http: HttpClient) {}
  getEmployeesByDepartmentId(departmentId: number): Observable<Employee[]> {
    return this.http.get<Employee[]>(`${this.baseUrl}/department/${departmentId}`);
  }
}
