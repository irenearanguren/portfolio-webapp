import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { Role } from '../../../core/models/role.model';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-auth-page-component',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './auth-page-component.html',
  styleUrl: './auth-page-component.css',
})
export class AuthPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly currentUser = this.authService.currentUser;

  mode: 'login' | 'register' = 'login';
  submitting = false;
  errorMessage = '';
  infoMessage = '';

  readonly loginForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  readonly registerForm = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    role: ['user' as Role, [Validators.required]],
  });

  constructor() {
    const dataMode = this.route.snapshot.data['mode'];
    this.mode = dataMode === 'register' ? 'register' : 'login';
  }

  canCreateAdmins(): boolean {
    return this.authService.canManageUsers();
  }

  switchMode(mode: 'login' | 'register'): void {
    this.mode = mode;
    this.errorMessage = '';
    this.infoMessage = '';
  }

  submitLogin(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.submitting = true;
    this.errorMessage = '';
    this.infoMessage = '';

    const { email, password } = this.loginForm.getRawValue();

    this.authService.login(email, password).subscribe({
      next: () => {
        const redirect = this.route.snapshot.queryParamMap.get('redirect') ?? '/projects';
        void this.router.navigateByUrl(redirect);
      },
      error: (error: Error) => {
        this.errorMessage = error.message;
        this.submitting = false;
      },
      complete: () => {
        this.submitting = false;
      },
    });
  }

  submitRegister(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.submitting = true;
    this.errorMessage = '';
    this.infoMessage = '';

    const payload = this.registerForm.getRawValue();

    this.authService.register(payload).subscribe({
      next: (user) => {
        this.infoMessage = `Usuario ${user.name} creado correctamente.`;
        this.registerForm.reset({ role: 'user' });

        if (!this.currentUser()) {
          this.switchMode('login');
          void this.router.navigate(['/auth/login']);
        }
      },
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
