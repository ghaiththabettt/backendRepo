// employee-salary.model.ts
export interface EmployeeSalary {
  payrollId?: number;
  employeeId: number; // Important: L'ID de l'employé associé
  employeeName?: string; // Nom pour affichage
  employeeEmail?: string; // Email pour affichage
  employeeDepartment?: string; // Département pour affichage
  basicSalary: number; // Salaire de base
  bonuses: number;     // Bonus (inclura le bonus de tâche si généré)
  deductions: number;  // Déductions
  totalSalary: number; // Total calculé
  payDate: string;     // Date de paiement (format string YYYY-MM-DD)
}