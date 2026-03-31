import { Injectable, computed, signal } from '@angular/core';
import { Observable, delay, map, of, throwError } from 'rxjs';

import { Role } from '../models/role.model';
import { User } from '../models/user.model';

type RegisterPayload = {
  name: string;
  email: string;
  password: string;
  role?: Role;
};

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly usersKey = 'i2e_users';
  private readonly sessionKey = 'i2e_session_user_id';
  private readonly usersSignal = signal<User[]>([]);
  private readonly currentUserSignal = signal<User | null>(null);

  readonly users = computed(() => this.usersSignal());
  readonly currentUser = computed(() => this.currentUserSignal());
  readonly isAuthenticated = computed(() => this.currentUserSignal() !== null);
  readonly currentRole = computed<Role | null>(() => this.currentUserSignal()?.role ?? null);

  constructor() {
    this.bootstrapUsers();
    this.restoreSession();
  }

  private get hasStorage(): boolean {
    return typeof localStorage !== 'undefined';
  }

  login(email: string, password: string): Observable<User> {
    const user = this.usersSignal().find((u) => u.email.toLowerCase() === email.toLowerCase().trim());

    if (!user || user.password !== password) {
      return throwError(() => new Error('Credenciales incorrectas.'));
    }

    const loggedUser: User = { ...user, isLoggedIn: true };
    this.currentUserSignal.set(loggedUser);
    this.usersSignal.update((users) =>
      users.map((item) => ({ ...item, isLoggedIn: item.id === loggedUser.id }))
    );

    this.persist();
    if (this.hasStorage) {
      localStorage.setItem(this.sessionKey, String(loggedUser.id));
    }

    return of(loggedUser).pipe(delay(250));
  }

  register(payload: RegisterPayload): Observable<User> {
    const users = this.usersSignal();
    const exists = users.some((u) => u.email.toLowerCase() === payload.email.toLowerCase().trim());

    if (exists) {
      return throwError(() => new Error('El correo ya se encuentra registrado.'));
    }

    const nextId = users.length ? Math.max(...users.map((u) => u.id)) + 1 : 1;
    const role: Role = payload.role ?? 'user';

    if (role === 'admin' && this.currentRole() !== 'admin') {
      return throwError(() => new Error('Solo un administrador puede crear administradores.'));
    }

    const user: User = {
      id: nextId,
      name: payload.name.trim(),
      email: payload.email.trim().toLowerCase(),
      role,
      password: payload.password,
      isLoggedIn: false,
    };

    this.usersSignal.update((current) => [...current, user]);
    this.persist();

    return of(user).pipe(delay(250));
  }

  logout(): void {
    const current = this.currentUserSignal();
    if (!current) {
      return;
    }

    this.usersSignal.update((users) => users.map((u) => ({ ...u, isLoggedIn: false })));
    this.currentUserSignal.set(null);
    if (this.hasStorage) {
      localStorage.removeItem(this.sessionKey);
    }
    this.persist();
  }

  canManageProjects(role: Role | null = this.currentRole()): boolean {
    return role === 'admin' || role === 'user';
  }

  canManageUsers(role: Role | null = this.currentRole()): boolean {
    return role === 'admin';
  }

  private bootstrapUsers(): void {
    const rawUsers = this.hasStorage ? localStorage.getItem(this.usersKey) : null;

    if (rawUsers) {
      const users = JSON.parse(rawUsers) as User[];
      this.usersSignal.set(users);
      return;
    }

    const seedUsers: User[] = [
      {
        id: 1,
        name: 'Admin Demo',
        email: 'admin@i2e.com',
        role: 'admin',
        password: 'admin123',
        isLoggedIn: false,
      },
      {
        id: 2,
        name: 'Usuario Demo',
        email: 'user@i2e.com',
        role: 'user',
        password: 'user123',
        isLoggedIn: false,
      },
      {
        id: 3,
        name: 'Viewer Demo',
        email: 'viewer@i2e.com',
        role: 'viewer',
        password: 'viewer123',
        isLoggedIn: false,
      },
    ];

    this.usersSignal.set(seedUsers);
    this.persist();
  }

  private restoreSession(): void {
    if (!this.hasStorage) {
      return;
    }

    const userIdRaw = localStorage.getItem(this.sessionKey);
    if (!userIdRaw) {
      return;
    }

    const userId = Number(userIdRaw);
    if (Number.isNaN(userId)) {
      localStorage.removeItem(this.sessionKey);
      return;
    }

    const user = this.usersSignal().find((u) => u.id === userId);
    if (!user) {
      localStorage.removeItem(this.sessionKey);
      return;
    }

    const loggedUser: User = { ...user, isLoggedIn: true };
    this.currentUserSignal.set(loggedUser);
    this.usersSignal.update((users) => users.map((u) => ({ ...u, isLoggedIn: u.id === user.id })));
    this.persist();
  }

  private persist(): void {
    if (this.hasStorage) {
      localStorage.setItem(this.usersKey, JSON.stringify(this.usersSignal()));
    }
  }
}
