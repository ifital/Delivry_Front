// auth.service.ts
import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

// Interfaces
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}

export interface RegisterRequest {
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  adresse: string;
  password: string;
  role: 'ADMIN' | 'CLIENT' | 'LIVREUR' | 'DESTINATAIRE';
  vehicule?: string;
  zoneAssigneeId?: string;
}

export interface RegisterResponse {
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private http = inject(HttpClient);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);

  private apiUrl = 'http://localhost:8082/auth';
  private tokenKey = 'auth_token';

  // initialisé à false (SSR-safe)
  private loggedIn = new BehaviorSubject<boolean>(false);
  public isLoggedIn$ = this.loggedIn.asObservable();

  constructor() {
    if (this.isBrowser() && this.hasToken()) {
      this.loggedIn.next(true);
    }
  }

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  /* ================= AUTH ================= */

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap(response => {
          this.setToken(response.token);
          this.loggedIn.next(true);
        })
      );
  }

  register(userData: RegisterRequest): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.apiUrl}/register`, userData);
  }

  logout(): void {
    if (this.isBrowser()) {
      localStorage.removeItem(this.tokenKey);
    }
    this.loggedIn.next(false);
    this.router.navigate(['/login']);
  }

  /* ================= TOKEN ================= */

  private setToken(token: string): void {
    if (this.isBrowser()) {
      localStorage.setItem(this.tokenKey, token);
    }
  }

  getToken(): string | null {
    if (!this.isBrowser()) {
      return null;
    }
    return localStorage.getItem(this.tokenKey);
  }

  private hasToken(): boolean {
    return !!this.getToken();
  }

  isLoggedIn(): boolean {
    return this.isBrowser() && this.hasToken();
  }

  /* ================= USER INFO ================= */

  getUserInfo(): any {
    if (!this.isBrowser()) {
      return null;
    }

    const token = this.getToken();
    if (!token) return null;

    try {
      const payload = token.split('.')[1];
      return JSON.parse(atob(payload));
    } catch {
      return null;
    }
  }

  getUserRole(): string | null {
    return this.getUserInfo()?.role ?? null;
  }
}
