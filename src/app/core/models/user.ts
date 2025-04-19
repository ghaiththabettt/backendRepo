import { Role } from './role';

export class User {
  id!: number;
  email!: string;
  password!: string;
  firstName!: string;
  lastName!: string;
  role!: string;
  token!: string;
  roles?: string[];
  img?: string;
  userType?: string;
  accessToken?: string;
  tokenType?: string;
  type?: string;
  name?: string;
}
