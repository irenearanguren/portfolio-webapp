import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
    {
    path: 'auth/login',
    loadComponent: () =>
      import('./features/auth/auth-page-component/auth-page-component').then(
        (m) => m.AuthPageComponent
      ),
    data: { mode: 'login' },
  },
  {
    path: 'auth/register',
    loadComponent: () =>
      import('./features/auth/auth-page-component/auth-page-component').then(
        (m) => m.AuthPageComponent
      ),
    data: { mode: 'register' },
  },
  {
    path: 'auth',
    redirectTo: 'auth/login',
    pathMatch: 'full',
  },
  {
    path: 'projects',
        canActivate: [authGuard],
    loadChildren: () =>
            import('./features/project/project-routing-module').then((m) => m.PROJECT_ROUTES),
  },
    { path: '', redirectTo: 'projects', pathMatch: 'full' },
    { path: '**', redirectTo: 'projects' },
];
