// Example: Adjust based on your actual backend response structure
export interface Employee {
  id?: number;
  name?: string;
  lastName?: string;
  email?: string;
  password?: string;
  dateOfBirth?: Date;
  hireDate?: Date;
  salary?: number;
  position?: string;
  // --- Ensure Department structure is correct ---
  department?: {
    departmentId: number;
    departmentName: string; // <-- Make sure this field exists and is populated
    // other department fields...
  };
  jobPositionId?: number;
  contractId?: number;
  address?: string;
  phoneNumber?: string;
  userType?: string;
  // Potentially other fields returned by '/all'
}