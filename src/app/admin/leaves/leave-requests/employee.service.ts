import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Employee } from 'app/admin/leaves/leave-requests/employee.model'; // Ensure this model includes department info
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { AuthService } from 'app/core/service/auth.service';
import { environment } from 'environments/environment';
export interface EmployeeListItem {
  id: number;
  fullName: string;
  departmentName: string; // Should exist
}

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private employeeApiUrl = `http://localhost:8083/api/employee`; // Adjust if needed

  constructor(private http: HttpClient, private authService: AuthService) { }

  getEmployeeListForDropdown(): Observable<EmployeeListItem[]> {
    // Use the corrected '/list' endpoint
    return this.http.get<any[]>(`${this.employeeApiUrl}/list`).pipe( // Expect any[] for logging flexibility
      map(backendEmployees => {
        // --- LOG 1: RAW BACKEND RESPONSE ---
        console.log('[EmployeeService] Raw backend response for /list:', JSON.stringify(backendEmployees));
        // ------------------------------------

        return backendEmployees
          .filter(emp => typeof emp.id === 'number' && !isNaN(emp.id))
          .map(emp => {
            // --- LOG 2: INDIVIDUAL EMPLOYEE OBJECT FROM BACKEND ---
            console.log('[EmployeeService] Processing backend employee object:', JSON.stringify(emp));
            // ------------------------------------------------------

            const listItem: EmployeeListItem = {
              id: emp.id,
              // Use fullName directly if backend provides it, otherwise construct it
              fullName: emp.fullName || `${emp.name || ''} ${emp.lastName || ''}`.trim(),
              // Extract departmentName, provide 'N/A' as fallback
              departmentName: emp.departmentName || 'N/A' // <--- Check if 'emp.departmentName' has the value
            };

            // --- LOG 3: MAPPED LIST ITEM ---
            console.log('[EmployeeService] Mapped EmployeeListItem:', JSON.stringify(listItem));
            // ---------------------------------
            return listItem;
          });
      }),
      // Sorting
      map(employeeList => employeeList.sort((a, b) => a.fullName.localeCompare(b.fullName))),
      catchError(this.handleError)
    );
  }

  // ... other methods (getAllEmployees, handleError) ...
    getAllEmployees(): Observable<Employee[]> {
      // This still fetches the full Employee model if needed elsewhere
      return this.http.get<Employee[]>(`${this.employeeApiUrl}/all`); // Assuming you use '/all' for full details
    }

    private handleError(error: HttpErrorResponse): Observable<never> {
      let errorMessage = 'An unknown error occurred!';
      if (error.error instanceof ErrorEvent) {
        errorMessage = `Client-side error: ${error.error.message}`;
      } else {
        const errorBody = error.error;
        const backendMessage = typeof errorBody === 'string' ? errorBody : errorBody?.message || errorBody?.error || error.message;
        errorMessage = `Server returned code ${error.status}: ${backendMessage || 'Unknown server error'}`;
        console.error(
          `Backend returned code ${error.status}, ` +
          `body was: `, error.error);
      }
      console.error('[EmployeeService] Error handled:', errorMessage);
      return throwError(() => new Error(errorMessage));
    }
}