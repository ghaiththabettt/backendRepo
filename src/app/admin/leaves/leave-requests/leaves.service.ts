import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { catchError, map, tap } from 'rxjs/operators';
import { Leaves, LeaveDTO } from './leaves.model'; // Import both
import { environment } from 'environments/environment'; // Use environment for API URL

@Injectable({
  providedIn: 'root',
})
export class LeavesService {
  // Define the base API URL in your environment files
  private readonly API_URL = 'http://localhost:8083/api/leaves'; // e.g., http://localhost:8080/api/leaves

  constructor(private httpClient: HttpClient) {}

  // Helper to map backend DTO to frontend model
  private mapDtoToModel(dto: LeaveDTO): Leaves {
   // Log pour vérifier le DTO reçu
  console.log(`DTO reçu pour mapDtoToModel (ID: ${dto.leaveId}):`, JSON.stringify(dto));

  return new Leaves({
    id: dto.leaveId,
    img: dto.employeeImg,
    name: dto.employeeName,
    employeeId: dto.employeeId,
    department: dto.departmentName,
    type: dto.leaveType,
    from: dto.startDate,
    leaveTo: dto.endDate,
    noOfDays: dto.numberOfDays,
    durationType: dto.durationType,
    status: dto.statusLeave,
    reason: dto.reason,
    note: dto.note,
    requestedOn: dto.requestedOn,
    // *** CORRECTION ICI ***
    approvedBy: dto.actionedByName,   // <-- Utiliser actionedByName
    approvalDate: dto.actionDate,     // <-- Utiliser actionDate
  });
}

  
  private mapModelToDto(leaves: Leaves): Partial<LeaveDTO> {
      
      return {
          leaveId: leaves.id !== 0 ? leaves.id : undefined, // Send ID only for updates
          employeeId: leaves.employeeId, // Crucial: Backend needs to know which employee
          leaveType: leaves.type,
          startDate: leaves.from,
          endDate: leaves.leaveTo,
          numberOfDays: leaves.noOfDays,
          durationType: leaves.durationType,
          reason: leaves.reason,
          note: leaves.note,
          
      };
  }

  /** GET: Fetch all leaves */
  getAllLeaves(): Observable<Leaves[]> {
    return this.httpClient
      .get<LeaveDTO[]>(this.API_URL) // Expect an array of DTOs
      .pipe(
        map(dtos => dtos.map(this.mapDtoToModel)), // Map each DTO to the frontend model
        catchError(this.handleError)
      );
  }

  /** POST: Add a new leave */
  addLeaves(leaves: Leaves): Observable<Leaves> {
    const leaveDtoPayload = this.mapModelToDto(leaves);
    // Backend will assign ID, set status to PENDING, set requestedOn
    return this.httpClient.post<LeaveDTO>(this.API_URL, leaveDtoPayload).pipe(
      map(this.mapDtoToModel), // Map the returned DTO (with ID, etc.) back to model
      catchError(this.handleError)
    );
  }

  /** PUT: Update an existing leave */
  updateLeaves(leaves: Leaves): Observable<Leaves> {
    const leaveDtoPayload = this.mapModelToDto(leaves);
    // Backend expects ID in the URL
    return this.httpClient.put<LeaveDTO>(`${this.API_URL}/${leaves.id}`, leaveDtoPayload).pipe(
      map(this.mapDtoToModel), // Map the returned updated DTO back to model
      catchError(this.handleError)
    );
  }

  /** DELETE: Remove a leave by ID */
  deleteLeaves(id: number): Observable<number> {
    return this.httpClient.delete<void>(`${this.API_URL}/${id}`).pipe(
      map(() => id), // Return the ID on success
      catchError(this.handleError)
    );
  }

  /** PUT: Approve a leave request */
  approveLeave(id: number): Observable<Leaves> {
    // Backend might require the approver's ID in the request body or derive from security context
    // Keeping it simple here, assuming backend handles approver ID based on logged-in user
    return this.httpClient.put<LeaveDTO>(`${this.API_URL}/${id}/approve`, {}).pipe(
      map(this.mapDtoToModel), // Map the updated DTO (status=APPROVED, approver details) back to model
      catchError(this.handleError)
    );
  }

  /** PUT: Reject a leave request */
  rejectLeave(id: number): Observable<Leaves> {
    // Similar to approve, backend handles rejecter ID
    return this.httpClient.put<LeaveDTO>(`${this.API_URL}/${id}/reject`, {}).pipe(
      map(this.mapDtoToModel), // Map the updated DTO (status=REJECTED, rejecter details) back to model
      catchError(this.handleError)
    );
  }


  /** Handle Http operation that failed */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred!';
    if (error.error instanceof ErrorEvent) {
      // Client-side or network error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Backend returned an unsuccessful response code
      // The response body may contain clues as to what went wrong
      errorMessage = `Server returned code ${error.status}, error message is: ${error.message}`;
      if (error.error && typeof error.error === 'string') {
          errorMessage += ` Details: ${error.error}`;
      } else if (error.error && error.error.message) {
           errorMessage += ` Details: ${error.error.message}`;
      }
       // Log the detailed error object for debugging
       console.error('Backend error details:', error.error);
    }
    console.error(errorMessage); // Log to console
    return throwError(() => new Error('Something went wrong; please try again later. ' + errorMessage));
  }
}