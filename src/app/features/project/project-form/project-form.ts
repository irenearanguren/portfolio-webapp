import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { ProjectStatus } from '../../../core/models/project.model';
import { AuthService } from '../../../core/services/auth.service';
import { ProjectService } from '../../../core/services/project.service';

@Component({
  selector: 'app-project-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './project-form.html',
  styleUrl: './project-form.css',
})
export class ProjectForm {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly projectService = inject(ProjectService);
  private readonly authService = inject(AuthService);

  readonly statusOptions: Array<{ value: ProjectStatus; label: string }> = [
    { value: 'draft', label: 'Borrador' },
    { value: 'active', label: 'Activo' },
    { value: 'paused', label: 'Pausado' },
    { value: 'completed', label: 'Completado' },
  ];

  editingId: string | null = null;
  submitting = false;
  errorMessage = '';

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    description: ['', [Validators.required, Validators.minLength(10)]],
    status: ['draft' as ProjectStatus, [Validators.required]],
  });

  constructor() {
    const idRaw = this.route.snapshot.paramMap.get('id');
    this.editingId = idRaw;

    if (this.editingId) {
      this.projectService.getProjectById(this.editingId).subscribe({
        next: (project) => {
          if (!project) {
            this.errorMessage = 'No fue posible cargar el proyecto.';
            return;
          }

          this.form.patchValue({
            name: project.name,
            description: project.description,
            status: project.status,
          });
        },
        error: (error: Error) => {
          this.errorMessage = error.message;
        },
      });
    }
  }

  get title(): string {
    return this.editingId ? 'Editar proyecto' : 'Nuevo proyecto';
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const currentUser = this.authService.currentUser();
    if (!currentUser) {
      void this.router.navigate(['/auth/login']);
      return;
    }

    this.submitting = true;
    this.errorMessage = '';
    const payload = this.form.getRawValue();

    if (this.editingId) {
      this.projectService.updateProject(this.editingId, payload).subscribe({
        next: () => void this.router.navigate(['/projects', this.editingId]),
        error: (error: Error) => {
          this.errorMessage = error.message;
          this.submitting = false;
        },
        complete: () => {
          this.submitting = false;
        },
      });
      return;
    }

    this.projectService
      .createProject({
        ...payload,
        ownerId: currentUser.id,
      })
      .subscribe({
        next: (project) => void this.router.navigate(['/projects', project.id]),
        error: (error: Error) => {
          this.errorMessage = error.message;
          this.submitting = false;
        },
        complete: () => {
          this.submitting = false;
        },
      });
  }

}
