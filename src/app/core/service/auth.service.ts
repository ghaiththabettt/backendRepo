import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, map, catchError, throwError } from 'rxjs';
import { User } from '../models/user';
import { Role } from '../models/role';
import { environment } from '../../../environments/environment';
import { Employee } from 'models/employee.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;
  private apiUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {
    this.currentUserSubject = new BehaviorSubject<User | null>(
      JSON.parse(localStorage.getItem('currentUser') || 'null')
    );
    this.currentUser = this.currentUserSubject.asObservable();
  }
  
  // Méthode dédiée à l'inscription d'un employé (réservée aux admins)
  registerEmployee(employee: Employee): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/admin/signup`, employee, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    });
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  private mapUserRole(backendRole: string): Role {
    switch (backendRole) {
      case 'ROLE_ADMIN':
        return Role.Admin;
      case 'ROLE_EMPLOYEE':
        return Role.Employee;
      case 'ROLE_CLIENT':
        return Role.Client;
      default:
        return Role.Client;
    }
  }

  login(email: string, password: string): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this.http.post<any>(`${this.apiUrl}/auth/signin`, { email, password }, { headers })
      .pipe(
        map(response => {
          console.log('Login response:', response);
          const user = new User();
          user.id = response.id;
          user.email = response.email;
          user.firstName = response.name || response.firstName;
          user.lastName = response.lastName;
          user.role = this.mapUserRole(response.userType || response.roles[0]);
          user.token = response.accessToken || response.token;
          user.roles = response.roles || [response.userType];
          user.img = 'assets/images/user/user.jpg';
          
          localStorage.setItem('currentUser', JSON.stringify(user));
          this.currentUserSubject.next(user);
          return user;
        }),
        catchError(error => {
          console.error('Erreur détaillée:', error);
          if (error.status === 401) {
            return throwError(() => 'Email ou mot de passe incorrect');
          }
          if (error.status === 404) {
            return throwError(() => 'Le serveur est inaccessible');
          }
          if (error.status === 0) {
            return throwError(() => 'Erreur de connexion au serveur. Vérifiez que le serveur est démarré.');
          }
          return throwError(() => error.error?.message || 'Une erreur est survenue lors de la connexion');
        })
      );
  }

  logout(): Observable<any> {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    return new Observable(observer => {
      observer.next(true);
      observer.complete();
    });
  }
}
