export type Priority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  category: string;
  dueDate: string | null;  // 'YYYY-MM-DD' or null
  completed: boolean;
  createdAt: string;       // ISO datetime string
}
