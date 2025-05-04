import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Employee } from 'app/admin/leaves/leave-requests/employee.model'; // <-- ASSUREZ-VOUS QUE CE CHEMIN EST CORRECT
import { EmployeeListItem } from 'app/admin/leaves/leave-requests/employee.model'; // <-- ASSUREZ-VOUS QUE CE CHEMIN EST CORRECT
import { Observable, throwError } from 'rxjs'; // Importer throwError de rxjs
import { map, catchError } from 'rxjs/operators';
// import { AuthService } from 'app/core/service/auth.service'; // Décommentez si besoin
import { environment } from 'environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private employeeApiUrl = `${environment.apiUrl}/api/employee`;

  constructor(private http: HttpClient) {}

  /**
   * Récupère la liste complète et la mappe vers l'interface Employee.
   * CORRIGE le mapping pour s'assurer que l'objet 'department' est créé.
   */
  getAllEmployees(): Observable<Employee[]> {
    // L'API /all retourne List<Map<String, Object>>
    return this.http.get<any[]>(`${this.employeeApiUrl}/all`).pipe(
      map(backendDataArray => {
        console.log("[EmployeeService - getAllEmployees] Raw data from /all:", JSON.stringify(backendDataArray.slice(0, 2))); // Log raw sample
        if (!Array.isArray(backendDataArray)) {
          console.error("[EmployeeService - getAllEmployees] Expected an array from /all, received:", backendDataArray);
          return [];
        }
        // Transformation
        return backendDataArray.map((empMap, index) => {
          // --- Vérification explicite des clés reçues du backend ---
          const backendDeptId = empMap.departmentId;
          const backendDeptName = empMap.departmentName;
          // Log pour les 2 premiers employés pour voir les clés reçues
          // if (index < 2) {
          //   console.log(`[EmployeeService - getAllEmployees] Processing empMap ${index}: DeptId=${backendDeptId}, DeptName=${backendDeptName}`);
          // }

          const employee: Employee = {
            id: empMap.id,
            name: empMap.name,
            lastName: empMap.lastName,
            email: empMap.email,
            hireDate: empMap.hireDate,
            salary: empMap.salary,
            dateOfBirth: empMap.dateOfBirth,
            position: empMap.position,
            address: empMap.address,
            phoneNumber: empMap.phoneNumber,
            userType: empMap.userType,

            // --- CORRECTION MAPPING DEPARTMENT ---
            // Créer l'objet 'department' SEULEMENT si departmentId est valide (non null/undefined)
            department: backendDeptId != null
              ? {
                  departmentId: backendDeptId as number, // Assurer le type number
                  departmentName: backendDeptName || undefined // Utiliser le nom s'il existe, sinon undefined
                }
              : undefined // Mettre undefined si pas de departmentId
            // --- FIN CORRECTION ---
          };

           // Log pour vérifier l'objet mappé (les 2 premiers)
           // if (index < 2) {
           //    console.log(`[EmployeeService - getAllEmployees] Mapped Employee ${index}:`, JSON.stringify(employee));
           // }

          return employee;
        });
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Récupère la liste simplifiée pour les dropdowns.
   */
  getEmployeeListForDropdown(): Observable<EmployeeListItem[]> {
    // Assurez-vous que le backend /listemp retourne {id, fullName, departmentName}
    return this.http.get<EmployeeListItem[]>(`${this.employeeApiUrl}/listemp`).pipe(
      map(employees => {
         console.log('[EmployeeService - getEmployeeListForDropdown] Raw data from /listemp:', employees);
         return employees
                 .filter(emp => typeof emp?.id === 'number' && typeof emp?.fullName === 'string')
                 .sort((a, b) => a.fullName.localeCompare(b.fullName));
        }),
      catchError(this.handleError)
    );
  }

  // --- Autres méthodes (getById, create, update, delete) ---
  getEmployeeById(id: number): Observable<Employee> { /* ... */ return this.http.get<Employee>(`${this.employeeApiUrl}/${id}`).pipe(catchError(this.handleError));}
  createEmployee(emp: Employee): Observable<Employee> { /* ... */ return this.http.post<Employee>(this.employeeApiUrl, emp).pipe(catchError(this.handleError)); }
  updateEmployee(id: number, employee: Employee): Observable<Employee> { /* ... */ return this.http.put<Employee>(`${this.employeeApiUrl}/${id}`, employee).pipe(catchError(this.handleError)); }
  deleteEmployee(id: number): Observable<void> { /* ... */ return this.http.delete<void>(`${this.employeeApiUrl}/${id}`).pipe(catchError(this.handleError)); }


  // --- Gestionnaire d'erreurs ---
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred!';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Client-side/Network error: ${error.error.message}`;
    } else {
      const errorBody = error.error;
      const backendMessage = typeof errorBody === 'string' ? errorBody : errorBody?.message || errorBody?.error || error.message || error.statusText;
      errorMessage = `Server error (Status ${error.status}): ${backendMessage || 'Unknown server error'}`;
      console.error(`Backend returned code ${error.status}, body was: `, error.error);
    }
    console.error('[EmployeeService] Error handled:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}