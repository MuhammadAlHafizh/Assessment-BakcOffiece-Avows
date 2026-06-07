
export interface AuditLog {
  date: string;
  time: string;
  name: string;
  action: string;
}

export interface Employee {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  birthDate: Date;
  basicSalary: number;
  status: string;
  group: { id: string; name: string };
  description: Date;
  history?: AuditLog[];
}
