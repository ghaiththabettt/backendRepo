// src/app/models/employee.model.ts (Vérifiez/Adaptez le chemin)

export interface Employee {
  id: number;
  name: string;
  lastName: string;
  email?: string;
  hireDate?: string | Date;
  salary?: number;
  dateOfBirth?: string | Date;
  position?: string; // Nom de l'enum EEmployeePosition
  address?: string;
  phoneNumber?: string;
  userType?: string; // Nom de l'enum EUserType

  // --- Structure du département imbriqué ---
  // Cette définition est essentielle pour que le composant fonctionne
  department?: {
    departmentId: number;
    departmentName?: string;
  };
  // --- Fin Structure Département ---
}

// Interface pour la liste simplifiée
export interface EmployeeListItem {
  id: number;
  fullName: string;
  departmentName: string;
}