import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './core/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  template: `
    <div class="app-container">
      <nav class="navbar" *ngIf="auth.isLoggedIn()">
        <div class="nav-brand">
          <img src="assets/logo.png" class="logo-img" alt="DyeMix Logo">
          <span class="brand-name">DyeMix</span>
        </div>
        <div class="nav-links">
          <a routerLink="/dashboard" routerLinkActive="active">Dashboard</a>
        </div>
        <div class="nav-user">
          <span class="user-email">{{ auth.currentUser()?.email }}</span>
          <button class="btn-logout" (click)="auth.logout()">Logout</button>
        </div>
      </nav>
      <main class="main-content">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .app-container { min-height: 100vh; background: #f8f9fa; }
    .navbar {
      display: flex; align-items: center; padding: 0 24px; height: 60px;
      background: #fff; border-bottom: 1px solid #e2e8f0;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }
    .nav-brand { display: flex; align-items: center; gap: 12px; margin-right: 32px; }
    .logo-img { height: 38px; width: auto; object-fit: contain; display: block; }
    .brand-name { font-size: 20px; font-weight: 700; color: #1a202c; }
    .nav-links { flex: 1; display: flex; gap: 16px; }
    .nav-links a {
      text-decoration: none; color: #64748b; font-weight: 500;
      padding: 8px 12px; border-radius: 6px; transition: all 0.2s;
    }
    .nav-links a:hover, .nav-links a.active { color: #4f46e5; background: #eef2ff; }
    .nav-user { display: flex; align-items: center; gap: 12px; }
    .user-email { color: #64748b; font-size: 14px; }
    .btn-logout {
      padding: 6px 14px; border: 1px solid #e2e8f0; border-radius: 6px;
      background: white; color: #64748b; cursor: pointer; font-size: 13px;
    }
    .btn-logout:hover { border-color: #ef4444; color: #ef4444; }
    .main-content { padding: 24px; max-width: 1400px; margin: 0 auto; }
  `]
})
export class AppComponent {
  constructor(public auth: AuthService) {}
}
