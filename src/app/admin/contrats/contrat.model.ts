// Define a minimal Employee model just for displaying employee info within a contract
export interface EmployeeLite {
  id: number;
  name: string; // Matches backend User.name
  lastName: string; // Matches backend User.lastName
  email?: string;
  fullName: string; // Assuming your backend EmployeeLite or User has a fullName derived property
  departmentName?: string; // Optionnel <-- Assurez-vous qu'il est ici

}

// Define the Contract model to match the backend entity structure
export interface Contrat {
  contractId?: number;
  contractType: 'FULL_TIME' | 'PART_TIME' | 'TEMPORARY' | 'INTERNSHIP' | 'FREELANCE' | string;
  startDate: string; // Use string for date (YYYY-MM-DD)
  endDate?: string | null;
  renewalDate?: string | null;
  reference: string;
  description?: string | null;
  statut: 'ACTIF' | 'NON_ACTIF' | string;

  // --- Fields for file metadata (content is not part of standard GET) ---
  fileName?: string | null;
  fileType?: string | null;
  // fileContent?: any; // NOT included in typical GET responses due to backend LAZY loading
  // --- End of file fields ---

  employee?: EmployeeLite; // Backend returns nested Employee object on GET
  employeeId?: number; // Add for convenience in forms, used to send employee link
}