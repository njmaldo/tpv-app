

export interface UserProfile {
  id: string;
  userId: string;
  email: string;
  lastName?: string | null;
  birthDate?: string | null;
  shift?: string | null;
  age?: number | null;
  isActive: number | null;
}