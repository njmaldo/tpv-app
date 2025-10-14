

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  createdAt: string;
  roleId: string;
  emailVerified?: string | null;
}