export interface EmployeeSalary {
  payrollId?: number;
  employeeId: number;
  employeeName?: string;
  employeeEmail?: string;
  employeeDepartment?: string;
  basicSalary: number; // ✅ anciennement 'baseSalary'
  bonuses: number;
  deductions: number;
  totalSalary: number;
  payDate: string;
}
