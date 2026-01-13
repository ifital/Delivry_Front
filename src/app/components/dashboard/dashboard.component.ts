import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard-container">
      <h1>Tableau de bord</h1>
      <div class="user-card">
        <h2>Bienvenue !</h2>
        <p><strong>Email:</strong> {{ userEmail }}</p>
        <p><strong>Rôle:</strong> {{ userRole }}</p>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .user-card {
      background: white;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      margin-top: 2rem;
    }

    h1 {
      color: #333;
      margin-bottom: 1rem;
    }

    h2 {
      color: #007bff;
      margin-bottom: 1rem;
    }

    p {
      margin: 0.5rem 0;
      color: #666;
    }
  `]
})
export class DashboardComponent {
  private authService = inject(AuthService);

  userEmail = '';
  userRole = '';

  constructor() {
    const userInfo = this.authService.getUserInfo();
    this.userEmail = userInfo?.sub || '';
    this.userRole = userInfo?.role || '';
  }
}
