import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Training } from 'app/admin/departments/all-departments/department.model'; // Créez ce modèle si nécessaire

@Injectable({
  providedIn: 'root'
})
export class TrainingService {
  private baseUrl = 'http://localhost:8083/api/trainings';
  constructor(private http: HttpClient) {}
  getTrainingsByDepartmentId(departmentId: number): Observable<Training[]> {
    return this.http.get<Training[]>(`${this.baseUrl}/department/${departmentId}`);
  }
}
