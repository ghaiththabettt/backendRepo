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
  departmentId?: number;
  jobPositionId?: number;
  contractId?: number;
  address?: string;
  phoneNumber?: string;
  userType?: string; // Par exemple, 'ROLE_EMPLOYEE'
}
export interface EmployeeLitee {
  id: number;
  name: string; // Matches backend User.name
  lastName: string; // Matches backend User.lastName
  email?: string;
  fullName: string; // Assuming your backend EmployeeLite or User has a fullName derived property
}
export interface EmployeeListItem {
  id: number;
  fullName: string;
  departmentName: string;
}