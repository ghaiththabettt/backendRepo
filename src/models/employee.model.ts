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
