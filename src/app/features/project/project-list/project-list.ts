import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { Project } from '../../../core/models/project.model';
import { AuthService } from '../../../core/services/auth.service';
import { ProjectService } from '../../../core/services/project.service';

@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './project-list.html',
  styleUrl: './project-list.css',
})
export class ProjectList {
  private readonly projectService = inject(ProjectService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  projects: Project[] = [];
  loading = true;
  errorMessage = '';

  constructor() {
    this.loadProjects();
  }

  canManageProjects(): boolean {
    return this.authService.canManageProjects();
  }

  statusLabel(status: Project['status']): string {
    const labels: Record<Project['status'], string> = {
      draft: 'Borrador',
      active: 'Activo',
      paused: 'Pausado',
      completed: 'Completado',
    };
    return labels[status];
  }

  goToCreate(): void {
    void this.router.navigate(['/projects/new']);
  }

  deleteProject(projectId: number | string): void {
    if (!this.canManageProjects()) {
      return;
    }

    const confirmed = window.confirm('Esta accion eliminara el proyecto y sus tareas. Deseas continuar?');
    if (!confirmed) {
      return;
    }

    this.projectService.deleteProject(projectId).subscribe({
      next: () => this.loadProjects(),
      error: (error: Error) => {
        this.errorMessage = error.message;
      },
    });
  }

  private loadProjects(): void {
    this.loading = true;
    this.errorMessage = '';

    this.projectService
      .getProjects()
      .pipe(
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe({
      next: (projects) => {
        this.projects = projects;
        this.loading = false;
      },
      error: (error: Error) => {
        this.errorMessage = error.message;
        this.loading = false;
      },
    });
  }

}
