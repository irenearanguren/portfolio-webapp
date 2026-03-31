import { Role } from './role.model';
export interface User {
    id: number;
    name: string;
    email:string;

  role: Role;
  password?: string;
  isLoggedIn: boolean;
}

