// src/app/employee/my-leaves/my-leaves.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError, of } from 'rxjs'; // Ensure 'of' is imported
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { catchError, map, switchMap } from 'rxjs/operators';
import { MyLeaves, LeaveDTO } from './my-leaves.model'; // Import models
import { environment } from 'environments/environment';
import { AuthService } from 'app/core/service/auth.service'; // To get current user ID

@Injectable({
  providedIn: 'root',
})
export class MyLeavesService {
  private readonly API_URL = `${environment.apiUrl}/leaves`; // Use environment variable

  constructor(
    private httpClient: HttpClient,
    private authService: AuthService // Inject AuthService
    ) {}

  // Helper to get the current employee ID
  private getCurrentEmployeeId(): Observable<number> {
    return this.authService.currentUser.pipe(
      map(user => {
        if (!user || !user.id) {
          console.error('Current user or user ID not found in AuthService');
          throw new Error('User not authenticated or ID missing.');
        }
        return user.id;
      }),
      catchError(err => {
        console.error("Error getting user ID from AuthService:", err);
        const userStr = typeof localStorage !== 'undefined' ? localStorage.getItem('currentUser') : null;
        if (userStr) {
          try {
            const user = JSON.parse(userStr);
            if (user && user.id) {
              console.warn("Using employee ID from localStorage as fallback:", user.id);
              return of(user.id); // Return as observable using 'of'
            }
          } catch (e) {
             console.error("Error parsing user from localStorage:", e);
          }
        }
        return throwError(() => new Error('Could not determine current employee ID.'));
      })
    );
  }

  // ** CORRECTED MAPPING **
  // Helper to map backend DTO to frontend MyLeaves model
  private mapDtoToMyLeaves(dto: LeaveDTO): MyLeaves {
    return new MyLeaves({
      id: dto.leaveId,
      applyDate: dto.requestedOn,
      fromDate: dto.startDate,
      toDate: dto.endDate,
      durationType: dto.durationType, // Directly use durationType from DTO
      type: dto.leaveType,
      status: dto.statusLeave,
      reason: dto.reason,
    });
  }

  // ** CORRECTED MAPPING **
  // Helper to map frontend MyLeaves model to a partial DTO for POST/PUT
  private mapMyLeavesToDtoPayload(leave: MyLeaves): Partial<LeaveDTO> {
      return {
          leaveType: leave.type?.toUpperCase(), // Ensure uppercase, handle potential null
          startDate: leave.fromDate,
          endDate: leave.toDate,
          reason: leave.reason,
          durationType: leave.durationType?.toUpperCase(), // Directly use durationType, ensure uppercase
      };
  }

  /** GET: Fetch all leaves for the current employee */
  getAllMyLeaves(): Observable<MyLeaves[]> {
    return this.getCurrentEmployeeId().pipe(
      switchMap(employeeId => {
        if (!employeeId) return throwError(() => new Error('Employee ID not found'));
        // Assumes backend endpoint exists: GET /api/leaves/employee/{employeeId}
        return this.httpClient.get<LeaveDTO[]>(`${this.API_URL}/employee/${employeeId}`);
      }),
      map(dtos => dtos.map(this.mapDtoToMyLeaves)),
      catchError(this.handleError)
    );
  }

  /** POST: Add a new leave request for the current employee */
  addMyLeaves(leave: MyLeaves): Observable<MyLeaves> {
    return this.getCurrentEmployeeId().pipe(
      switchMap(employeeId => {
        if (!employeeId) return throwError(() => new Error('Employee ID not found'));
        const payload: Partial<LeaveDTO> = {
            ...this.mapMyLeavesToDtoPayload(leave),
            employeeId: employeeId,
        };
        return this.httpClient.post<LeaveDTO>(this.API_URL, payload);
      }),
      map(this.mapDtoToMyLeaves),
      catchError(this.handleError)
    );
  }

  /** PUT: Update an existing leave request (only if PENDING) */
  updateMyLeaves(leave: MyLeaves): Observable<MyLeaves> {
    if (leave.status !== 'PENDING') {
        return throwError(() => new Error('Only PENDING leave requests can be updated.'));
    }
    const payload = this.mapMyLeavesToDtoPayload(leave);
    // Backend MUST verify ownership and status before updating
    return this.httpClient.put<LeaveDTO>(`${this.API_URL}/${leave.id}`, payload).pipe(
      map(this.mapDtoToMyLeaves),
      catchError(this.handleError)
    );
  }

  /** DELETE: Remove a leave request by ID (only if PENDING) */
  deleteMyLeaves(id: number, currentStatus: string): Observable<number> {
     if (currentStatus !== 'PENDING') {
         return throwError(() => new Error('Only PENDING leave requests can be deleted.'));
     }
     // Backend MUST verify ownership and status before deleting
    return this.httpClient.delete<void>(`${this.API_URL}/${id}`).pipe(
      map(() => id),
      catchError(this.handleError)
    );
  }

  /** GET: Fetch available leave types */
  getLeaveTypes(): Observable<string[]> {
      // Assumes backend endpoint exists: GET /api/leaves/types
      return this.httpClient.get<any[]>(`${this.API_URL}/types`).pipe(
          map(response => response.map(item => typeof item === 'string' ? item : item.name || item.leaveType).filter(Boolean)),
          map(types => types.map(t => t.toUpperCase())),
          catchError(err => {
              console.error("Error fetching leave types:", err);
              return of(['ANNUAL', 'SICK', 'MEDICAL', 'MATERNITY', 'CASUAL']); // Fallback
          })
      );
  }

  /** Handle Http operation that failed */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred!';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      errorMessage = `Server returned code ${error.status}, error message is: ${error.message || error.error?.message || error.error?.error || 'Unknown server error'}`;
       console.error('Backend error details:', error.error);
    }
    console.error('[MyLeavesService] Error:', errorMessage);
    // Return a more specific user-facing error
    return throwError(() => new Error(error.error?.message || 'Failed to process leave request. Please try again.'));
  }
}