import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
// Import the updated model interface
import { Contrat } from './contrat.model'; 
import { environment } from 'environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ContratService {
  // Corrected API URL to match backend controller @RequestMapping
  private apiUrl = `${environment.apiUrl}/Contract`;

  
  constructor(private httpClient: HttpClient) {}

  getAllContrats(): Observable<Contrat[]> {
    return this.httpClient.get<Contrat[]>(`${this.apiUrl}`);
  }

  getContratById(id: number): Observable<Contrat> {
    return this.httpClient.get<Contrat>(`${this.apiUrl}/${id}`);
  }

   getContractsByEmployeeId(employeeId: number): Observable<Contrat[]> {
    return this.httpClient.get<Contrat[]>(`${this.apiUrl}/employee/${employeeId}`);
  }


  // Method to add a contract, now accepts a File object
  addContrat(contratData: any, file: File | null): Observable<Contrat> {
    const formData = new FormData();

    // Append contract data as a JSON blob (required by @RequestPart("contract"))
    formData.append(
      'contract',
      new Blob([JSON.stringify(contratData)], { type: 'application/json' })
    );

    // Append the file if it exists
    if (file) {
      formData.append('file', file, file.name); // 'file' must match backend @RequestPart name
    }

    // HttpClient automatically sets the correct Content-Type for FormData
    return this.httpClient.post<Contrat>(this.apiUrl, formData);
  }

  // Method to update a contract, now accepts a File object (optional)
  updateContrat(id: number, contratData: any, file: File | null): Observable<Contrat> {
     const formData = new FormData();

     // Append contract data as a JSON blob
     formData.append(
       'contract',
       new Blob([JSON.stringify(contratData)], { type: 'application/json' })
     );

     // Append the file if it exists
     if (file) {
       formData.append('file', file, file.name); // 'file' must match backend @RequestPart name
     } else {
        // If no new file is selected, we can optionally append an empty file part
        // to indicate no change, or the backend can simply handle the absence
        // of the 'file' part when 'required = false'. The current backend allows absence.
     }


    return this.httpClient.put<Contrat>(`${this.apiUrl}/${id}`, formData);
  }


  deleteContrat(id: number): Observable<void> {
    return this.httpClient.delete<void>(`${this.apiUrl}/${id}`);
  }

  // --- New method to download the PDF file ---
  downloadContratPdf(id: number): Observable<Blob> {
    // Fetch the file as a Blob (binary data)
    // responseType: 'blob' is crucial for handling binary responses
    return this.httpClient.get(`${this.apiUrl}/${id}/pdf`, { responseType: 'blob' });
  }
  // --- End of new method ---

}