import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http'; 
import { Observable } from 'rxjs';
import { Perks } from './perks.model'; 
import { environment } from 'environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PerksService {
  private baseUrl = 'http://localhost:8083/api/perks';
  private employeeUrl = 'http://localhost:8083/api/employee/all'; // URL pour récupérer tous les employés

  constructor(private http: HttpClient) {}

 
  // Récupérer un perk par ID
  getPerksById(id: number): Observable<Perks> {
    return this.http.get<Perks>(`${this.baseUrl}/${id}`);
  }

  getAllPerks(): Observable<Perks[]> {
    return this.http.get<Perks[]>(`${this.baseUrl}/all`);
  }

  createPerks(perks: Perks): Observable<Perks> {
    const token = localStorage.getItem('token');  // Assurez-vous que le token est bien présent dans le localStorage
    if (token) {
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      return this.http.post<Perks>(`${this.baseUrl}/create`, perks, { headers });
    } else {
      throw new Error('No token found');
    }
  }

  updatePerks(id: number, perks: Perks): Observable<Perks> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.put<Perks>(`${this.baseUrl}/update/${id}`, perks, { headers });
  }

  deletePerks(id: number): Observable<void> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.delete<void>(`${this.baseUrl}/delete/${id}`, { headers });
  }
}