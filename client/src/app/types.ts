export type UserRole = 'ADMIN' | 'AUDITOR';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
}

