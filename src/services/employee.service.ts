import { Injectable } from '@angular/core';
import { HttpClient ,HttpHeaders } from '@angular/common/http';
import { Employee } from '../models/employee.model';
import { EmployeeLite } from '../app/admin/contrats/contrat.model';
import { Observable } from 'rxjs';
import { AuthService } from 'app/core/service/auth.service'; // Assurez-vous que AuthService est importé
export interface EmployeeLitee {
  id: number;
  name: string; // Matches backend User.name
  lastName: string; // Matches backend User.lastName
  email?: string;
  fullName: string; // Assuming your backend EmployeeLite or User has a fullName derived property
}
@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  // L'endpoint renvoie maintenant tous les champs nécessaires
  private apiUrl = 'http://localhost:8083/api/employee/all';
  private apiUrl2 = `http://localhost:8083/api/employee`; // Example Employee base URL

  constructor(private http: HttpClient,private authService: AuthService) {}

  getAllEmployees(): Observable<Employee[]> {
    // Cette requête renvoie un tableau d'objets contenant
    // { id, name, lastName, dateOfBirth, hireDate, departmentId, contractId, ... }
    return this.http.get<Employee[]>(this.apiUrl);
  }

  getEmployeeById(id: number): Observable<Employee> {
    return this.http.get<Employee>(`http://localhost:8083/api/employee/${id}`);
  }

  createEmployee(emp: Employee): Observable<Employee> {
    
    // POST /api/employee
    return this.http.post<Employee>('http://localhost:8083/api/employee', emp);
  }

  updateEmployee(id: number, employee: Employee): Observable<Employee> {
    const token = this.authService.currentUserValue?.token;  // Récupérer le token à partir du service AuthService
    if (!token) {
      console.error("Token is missing");  // Vérifier si le token est bien récupéré
      throw new Error("Token is missing");  // Ou gérer l'erreur autrement
    }
  
    // Créer l'en-tête avec le token
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    console.log('Authorization header:', `Bearer ${token}`);  // Ajouter un log pour vérifier que le token est correctement attaché
  
    // Effectuer la requête PUT pour mettre à jour l'employé
    return this.http.put<Employee>(`http://localhost:8083/api/employee/${id}`, employee, { headers });
  }
  
  getEmployeesSimpleList(): Observable<EmployeeLite[]> {
    // Example endpoint URL - you need to implement this on the backend
    return this.http.get<EmployeeLite[]>(`${this.apiUrl2}/list`);
}


  deleteEmployee(id: number): Observable<void> {
    // DELETE /api/employee/{id}
    return this.http.delete<void>(`http://localhost:8083/api/employee/${id}`);
  }
}
function throwError(arg0: () => string): Observable<Employee> {
  throw new Error('Function not implemented.');
  
}

