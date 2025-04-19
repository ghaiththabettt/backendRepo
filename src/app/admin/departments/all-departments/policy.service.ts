import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Policy } from 'app/admin/departments/all-departments/department.model'; // Créez ce modèle si nécessaire

@Injectable({
  providedIn: 'root'
})
export class PolicyService {
  private baseUrl = 'http://localhost:8083/api/policies';
  constructor(private http: HttpClient) {}
  getPoliciesByDepartmentId(departmentId: number): Observable<Policy[]> {
    return this.http.get<Policy[]>(`${this.baseUrl}/department/${departmentId}`);
  }
}
