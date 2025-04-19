export enum TypeExpense {
  Meal = 'Meal',
  Transport = 'Transport',
  Hotel = 'Hotel'
}

export enum StatusExpense {
  Pending = 'Pending',  // Change "PENDING" en "Pending"
  Approved = 'Approved',  // Change "APPROVED" en "Approved"
  Rejected = 'Rejected'   // Change "REJECTED" en "Rejected"
}


// Interface simplifiée pour la sélection d'employé
export interface Employee {
  id: number;
  name: string;
  lastName: string;
}

export interface Expense {
  expenseId: number;
  type: TypeExpense;
  amount: number;
  date: Date;
  status: StatusExpense;
  employee: Employee;
}
