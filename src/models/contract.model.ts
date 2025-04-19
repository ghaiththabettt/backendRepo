export interface Contract {
    contractId?: number;
    contractType?: string;   // ou un enum: 'FULL_TIME' | 'PART_TIME' | 'TEMPORARY'
    startDate?: string;      // ou Date
    endDate?: string;        // ou Date
    renewalDate?: string;    // ou Date
    status?: string;         // ex. "Valid", "Expired", etc.
    employeeId?: number;
    reference: string; 
  }
  