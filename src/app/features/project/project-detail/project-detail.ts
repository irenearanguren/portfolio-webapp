import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { Project } from '../../../core/models/project.model';
import { Task, TaskStatus } from '../../../core/models/task.model';
import { AuthService } from '../../../core/services/auth.service';
import { ProjectService } from '../../../core/services/project.service';

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './project-detail.html',
  styleUrl: './project-detail.css',
})
export class ProjectDetail {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly projectService = inject(ProjectService);
  private readonly authService = inject(AuthService);

  readonly taskStatusOptions: Array<{ value: TaskStatus; label: string }> = [
    { value: 'todo', label: 'Por hacer' },
    { value: 'in_progress', label: 'En progreso' },
    { value: 'done', label: 'Completada' },
  ];

  project: Project | null = null;
  loading = true;
  submittingTask = false;
  editingTaskId: number | null = null;
  errorMessage = '';

  readonly taskForm = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    description: [''],
    status: ['todo' as TaskStatus, [Validators.required]],
    dueDate: [''],
  });

  constructor() {
    this.loadProject();
  }

  canManageProjects(): boolean {
    return this.authService.canManageProjects();
  }

  taskStatusLabel(status: TaskStatus): string {
    const labels: Record<TaskStatus, string> = {
      todo: 'Por hacer',
      in_progress: 'En progreso',
      done: 'Completada',
    };
    return labels[status];
  }

  startEditTask(task: Task): void {
    if (!this.canManageProjects()) {
      return;
    }

    this.editingTaskId = task.id;
    this.taskForm.patchValue({
      title: task.title,
      description: task.description ?? '',
      status: task.status,
      dueDate: task.dueDate ?? '',
    });
  }

  cancelEditTask(): void {
    this.editingTaskId = null;
    this.taskForm.reset({
      title: '',
      description: '',
      status: 'todo',
      dueDate: '',
    });
  }

  saveTask(): void {
    if (!this.project || this.taskForm.invalid || !this.canManageProjects()) {
      this.taskForm.markAllAsTouched();
      return;
    }

    this.submittingTask = true;
    this.errorMessage = '';

    const payload = this.taskForm.getRawValue();

    if (this.editingTaskId) {
      this.projectService.updateTask(this.project.id, this.editingTaskId, payload).subscribe({
        next: () => {
          this.cancelEditTask();
          this.loadProject();
        },
        error: (error: Error) => {
          this.errorMessage = error.message;
          this.submittingTask = false;
        },
        complete: () => {
          this.submittingTask = false;
        },
      });
      return;
    }

    this.projectService.addTask(this.project.id, payload).subscribe({
      next: () => {
        this.cancelEditTask();
        this.loadProject();
      },
      error: (error: Error) => {
        this.errorMessage = error.message;
        this.submittingTask = false;
      },
      complete: () => {
        this.submittingTask = false;
      },
    });
  }

  deleteTask(taskId: number): void {
    if (!this.project || !this.canManageProjects()) {
      return;
    }

    const confirmed = window.confirm('Deseas eliminar esta tarea?');
    if (!confirmed) {
      return;
    }

    this.projectService.deleteTask(this.project.id, taskId).subscribe({
      next: () => this.loadProject(),
      error: (error: Error) => {
        this.errorMessage = error.message;
      },
    });
  }

  deleteProject(): void {
    if (!this.project || !this.canManageProjects()) {
      return;
    }

    const confirmed = window.confirm('Se eliminara el proyecto completo. Continuar?');
    if (!confirmed) {
      return;
    }

    this.projectService.deleteProject(this.project.id).subscribe({
      next: () => void this.router.navigate(['/projects']),
      error: (error: Error) => {
        this.errorMessage = error.message;
      },
    });
  }

  private loadProject(): void {
    const idRaw = this.route.snapshot.paramMap.get('id');
    if (!idRaw) {
      this.errorMessage = 'Identificador de proyecto invalido.';
      this.loading = false;
      return;
    }

    this.loading = true;
    this.projectService.getProjectById(idRaw).subscribe({
      next: (project) => {
        this.project = project ?? null;
        if (!project) {
          this.errorMessage = 'Proyecto no encontrado.';
        }
      },
      error: (error: Error) => {
        this.errorMessage = error.message;
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      },
    });
  }

}
