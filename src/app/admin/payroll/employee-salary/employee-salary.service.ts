// employee-salary.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EmployeeSalary } from './employee-salary.model';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class EmployeeSalaryService {
  // L'API backend pour les opérations CRUD manuelles et GET all DTO
  private apiUrl = 'http://localhost:8083/api/payrolls';

  constructor(private http: HttpClient) { }

  // GET All: Récupère la liste des PayrollDTO
  getAll(): Observable<EmployeeSalary[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      map((backendDataArray) =>
        // Transforme chaque objet PayrollDTO du backend en objet EmployeeSalary pour le frontend
        backendDataArray.map((item) => ({
          payrollId: item.payrollId,
          employeeId: item.employeeId, // L'ID de l'employé
          employeeName: item.employeeName, // Nom complet
          employeeEmail: item.employeeEmail, // Email (ajouté)
          employeeDepartment: item.employeeDepartment, // Département
          basicSalary: item.basicSalary, // CORRECTION: Utiliser basicSalary
          bonuses: item.bonuses,
          deductions: item.deductions,
          totalSalary: item.totalSalary, // Le backend calcule déjà le total
          // Assurez-vous que le backend renvoie bien la date en format YYYY-MM-DD ou gérez la conversion ici si nécessaire
          payDate: item.payDate
        }))
      )
    );
  }

  // ADD: Crée une nouvelle fiche de paie manuelle
  add(payload: EmployeeSalary): Observable<EmployeeSalary> {
    // !! TRANSFORMATION NECESSAIRE !!
    // Le backend attend un objet Payroll avec une structure { employee: { id: ... }, ... }
    const backendPayload = {
      employee: {
        id: payload.employeeId // Crée l'objet 'employee' imbriqué avec juste l'ID
      },
      basicSalary: payload.basicSalary,
      bonuses: payload.bonuses,
      deductions: payload.deductions,
      payDate: payload.payDate, // Format YYYY-MM-DD attendu par LocalDate backend
      // Le backend va ignorer/recalculer totalSalary, donc pas besoin de l'envoyer ici.
      // payrollId ne doit pas être envoyé pour une création.
    };
    // Envoie le payload transformé à l'API POST
    return this.http.post<EmployeeSalary>(this.apiUrl, backendPayload);
    // Note: La réponse backend pourrait être l'entité Payroll brute.
    // Si c'est le cas, vous pourriez avoir besoin de mapper la réponse aussi,
    // mais souvent, après un POST/PUT, on recharge simplement la liste complète (this.load()).
  }

  // UPDATE: Met à jour une fiche de paie manuelle existante
  update(payload: EmployeeSalary): Observable<EmployeeSalary> {
    // !! TRANSFORMATION NECESSAIRE !!
    // Le backend attend un objet Payroll avec une structure { employee: { id: ... }, ... }
    const backendPayload = {
      // On inclut l'ID de l'employé pour que le backend puisse potentiellement le mettre à jour si nécessaire
      // (bien que ce ne soit pas typique de changer l'employé d'une fiche de paie existante).
      // Si le backend ne permet pas de changer l'employé, cet objet imbriqué pourrait ne pas être nécessaire pour PUT.
      // À vérifier avec la logique exacte de votre service backend 'updatePayroll'.
      // Pour être sûr, incluons-le.
      employee: {
        id: payload.employeeId
      },
      basicSalary: payload.basicSalary,
      bonuses: payload.bonuses,
      deductions: payload.deductions,
      payDate: payload.payDate,
      // Le backend recalcule totalSalary.
      // payrollId ne doit pas être dans le corps de la requête PUT, seulement dans l'URL.
    };
    // Envoie le payload transformé à l'API PUT
    return this.http.put<EmployeeSalary>(`${this.apiUrl}/${payload.payrollId}`, backendPayload);
     // Même note que pour add concernant la réponse.
  }

  // DELETE: Supprime une fiche de paie
  delete(id: number): Observable<void> {
    // Pas de transformation nécessaire, on envoie juste l'ID dans l'URL
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}