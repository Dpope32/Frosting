export interface Bill {
  id: string;
  name: string;
  amount: number;
  dueDate: number;
  createTask?: boolean;
  createdAt?: string;
  updatedAt?: string;
}
