import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of, switchMap, throwError } from 'rxjs';

import { Project } from '../models/project.model';
import { Task } from '../models/task.model';

type ProjectPayload = Pick<Project, 'name' | 'description' | 'status' | 'ownerId'>;
type TaskPayload = Pick<Task, 'title' | 'description' | 'status' | 'dueDate' | 'assigneeId'>;

@Injectable({ providedIn: 'root' })
export class ProjectService {
  private readonly baseUrl = 'http://localhost:3000/projects';

  constructor(private readonly http: HttpClient) {}

  getProjects(): Observable<Project[]> {
    return this.http.get<Project[]>(this.baseUrl);
  }

  getProjectById(id: number | string): Observable<Project | undefined> {
    return this.http.get<Project>(`${this.baseUrl}/${id}`).pipe(
      map((project) => project ?? undefined),
      catchError((error: { status?: number }) => {
        if (error.status === 404) {
          return of(undefined);
        }

        return throwError(() => error);
      })
    );
  }

  createProject(payload: ProjectPayload): Observable<Project> {
    const now = new Date().toISOString();

    const project: Omit<Project, 'id'> = {
      name: payload.name.trim(),
      description: payload.description.trim(),
      status: payload.status,
      ownerId: payload.ownerId,
      tasks: [],
      createdAt: now,
      updatedAt: now,
    };

    return this.http.post<Project>(this.baseUrl, project);
  }

  updateProject(id: number | string, payload: Partial<ProjectPayload>): Observable<Project> {
    const updated: Partial<Project> = {
      ...payload,
      name: payload.name?.trim(),
      description: payload.description?.trim(),
      updatedAt: new Date().toISOString(),
    };

    return this.http.patch<Project>(`${this.baseUrl}/${id}`, updated);
  }

  deleteProject(id: number | string): Observable<boolean> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(map(() => true));
  }

  addTask(projectId: number | string, payload: TaskPayload): Observable<Task> {
    return this.getProjectById(projectId).pipe(
      switchMap((project) => {
        if (!project) {
          return throwError(() => new Error('Proyecto no encontrado.'));
        }

        const nextId = project.tasks.length ? Math.max(...project.tasks.map((t) => t.id)) + 1 : 1;
        const task: Task = {
          id: nextId,
          title: payload.title.trim(),
          description: payload.description?.trim(),
          status: payload.status,
          dueDate: payload.dueDate,
          assigneeId: payload.assigneeId,
        };

        return this.http
          .patch<Project>(`${this.baseUrl}/${projectId}`, {
            tasks: [...project.tasks, task],
            updatedAt: new Date().toISOString(),
          })
          .pipe(map(() => task));
      })
    );
  }

  updateTask(
    projectId: number | string,
    taskId: number,
    payload: Partial<TaskPayload>
  ): Observable<Task> {
    return this.getProjectById(projectId).pipe(
      switchMap((project) => {
        if (!project) {
          return throwError(() => new Error('Proyecto no encontrado.'));
        }

        const currentTask = project.tasks.find((t) => t.id === taskId);
        if (!currentTask) {
          return throwError(() => new Error('Tarea no encontrada.'));
        }

        const updatedTask: Task = {
          ...currentTask,
          ...payload,
          title: payload.title ? payload.title.trim() : currentTask.title,
          description: payload.description ? payload.description.trim() : currentTask.description,
        };

        return this.http
          .patch<Project>(`${this.baseUrl}/${projectId}`, {
            tasks: project.tasks.map((task) => (task.id === taskId ? updatedTask : task)),
            updatedAt: new Date().toISOString(),
          })
          .pipe(map(() => updatedTask));
      })
    );
  }

  deleteTask(projectId: number | string, taskId: number): Observable<boolean> {
    return this.getProjectById(projectId).pipe(
      switchMap((project) => {
        if (!project) {
          return throwError(() => new Error('Proyecto no encontrado.'));
        }

        const hasTask = project.tasks.some((task) => task.id === taskId);
        if (!hasTask) {
          return throwError(() => new Error('Tarea no encontrada.'));
        }

        return this.http
          .patch<Project>(`${this.baseUrl}/${projectId}`, {
            tasks: project.tasks.filter((task) => task.id !== taskId),
            updatedAt: new Date().toISOString(),
          })
          .pipe(map(() => true));
      })
    );
  }
}
