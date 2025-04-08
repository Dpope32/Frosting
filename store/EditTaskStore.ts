import { create } from 'zustand';
import { Task } from '@/types/task';

interface EditTaskState {
  isOpen: boolean;
  taskToEdit: Task | null;
  openModal: (task: Task) => void;
  closeModal: () => void;
}

export const useEditTaskStore = create<EditTaskState>((set) => ({
  isOpen: false,
  taskToEdit: null,
  openModal: (task: Task) => set({ isOpen: true, taskToEdit: task }),
  closeModal: () => set({ isOpen: false, taskToEdit: null }),
}));
