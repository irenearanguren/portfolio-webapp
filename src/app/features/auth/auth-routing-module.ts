import { Routes } from '@angular/router';

export const AUTH_ROUTES: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./auth-page-component/auth-page-component').then((m) => m.AuthPageComponent),
    data: { mode: 'login' },
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./auth-page-component/auth-page-component').then((m) => m.AuthPageComponent),
    data: { mode: 'register' },
  },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
];
