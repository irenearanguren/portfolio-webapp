import { Routes } from '@angular/router';

import { roleGuard } from '../../core/guards/role.guard';

export const PROJECT_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./project-list/project-list').then((m) => m.ProjectList),
  },
  {
    path: 'new',
    canActivate: [roleGuard],
    data: { roles: ['admin', 'user'] },
    loadComponent: () => import('./project-form/project-form').then((m) => m.ProjectForm),
  },
  {
    path: ':id',
    loadComponent: () => import('./project-detail/project-detail').then((m) => m.ProjectDetail),
  },
  {
    path: ':id/edit',
    canActivate: [roleGuard],
    data: { roles: ['admin', 'user'] },
    loadComponent: () => import('./project-form/project-form').then((m) => m.ProjectForm),
  },
];
