import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <nav class="navbar" *ngIf="isLoggedIn">
      <div class="nav-brand">SmartLogi Delivery</div>
      <div class="nav-menu">
        <a routerLink="/dashboard" routerLinkActive="active">Dashboard</a>
        <span class="user-info">{{ userEmail }}</span>
        <button class="btn-logout" (click)="logout()">Déconnexion</button>
      </div>
    </nav>

    <router-outlet />
  `,
  styles: [`
    .navbar {
      background-color: #007bff;
      color: white;
      padding: 1rem 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .nav-brand {
      font-size: 1.5rem;
      font-weight: bold;
    }

    .nav-menu {
      display: flex;
      gap: 1rem;
      align-items: center;
    }

    .nav-menu a {
      color: white;
      text-decoration: none;
      padding: 0.5rem 1rem;
      border-radius: 4px;
    }

    .nav-menu a.active,
    .nav-menu a:hover {
      background-color: rgba(255,255,255,0.2);
    }

    .user-info {
      font-size: 0.9rem;
    }

    .btn-logout {
      background-color: #dc3545;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      cursor: pointer;
    }

    .btn-logout:hover {
      background-color: #c82333;
    }
  `]
})
export class AppComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  isLoggedIn = false;
  userEmail = '';

  ngOnInit() {
    this.authService.isLoggedIn$.subscribe(loggedIn => {
      this.isLoggedIn = loggedIn;
      if (loggedIn) {
        const userInfo = this.authService.getUserInfo();
        this.userEmail = userInfo?.sub || '';
      }
    });
  }

  logout() {
    this.authService.logout();
  }
}
