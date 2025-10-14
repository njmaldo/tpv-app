

// src/types/Employee.ts (Versión reescrita)

export interface Employee {
  // Campos de User
  id: string; 
  userId: string; 
  name: string;
  email: string;
  createdAt: string;
  roleId: string;
  emailVerified: string | null;
  // Campos de UserProfile (que pueden ser nulos debido al LEFT JOIN)
  lastName: string | null;
  shift: string | null;
  age: number | null;
  birthDate: string | null;
  isActive: boolean; // Mapeado de p.isActive (1 | 0)
}