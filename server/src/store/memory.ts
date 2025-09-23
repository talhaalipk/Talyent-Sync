export type MemoryUser = {
  _id: string;
  UserName: string;
  email: string;
  passwordHash: string;
  role: 'client' | 'freelancer' | 'admin';
  clientProfile?: { companyName?: string; budget?: number };
  freelancerProfile?: { skills?: string[]; hourlyRate?: number };
};

export const memoryUsers: Record<string, MemoryUser> = {};
