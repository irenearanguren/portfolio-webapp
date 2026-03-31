import { Task } from './task.model';

export type ProjectStatus = 'draft' | 'active' | 'paused' | 'completed';

export interface Project {
  id: number | string;
  name: string;
  description: string;
  status: ProjectStatus;
  ownerId: number;
  tasks: Task[];
  createdAt: string;
  updatedAt?: string;
}