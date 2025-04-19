export interface Department {
  // L'identifiant est présent mais vous pouvez l'ignorer dans l'affichage
  departmentId?: number;
  departmentName: string;
  phone: string;
  emailDept: string;
  // Id des employés associés (optionnel)
  employeeIds?: number[];
  // Nombre total d'employés calculé par le backend
  totalEmployees?: number;
  // Id des postes associés
  jobPositionIds?: number[];
  // Id des formations associées
  trainingIds?: number[];
  // Id des policies associées
  policyIds?: number[];
}
export interface Employee {
  id: number;
  name: string;
  lastName: string;
  email: string;
  // d'autres propriétés si nécessaire
}

export interface Training {
  trainingId: number;
  topic: string;
  startDate: string;
  endDate: string;
  trainingType: string;
  trainingName: string;
  // d'autres propriétés si nécessaire
}

export interface Policy {
  policyId: number;
  policyName: string;
  description: string;
  departmentId?: number;

  // d'autres propriétés si nécessaire
}