export interface Bill {
  id: string;
  name: string;
  amount: number;
  dueDate: number; 
  createdAt?: string;
  updatedAt?: string;
}