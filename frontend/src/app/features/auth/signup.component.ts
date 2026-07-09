import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="auth-card">
        <div class="auth-header">
          <img src="assets/logo.png" class="logo-img" alt="DyeMix Logo">
          <h1>DyeMix</h1>
          <p class="tagline">Dye Formulation - Simplified!</p>
          <p class="signup-text">Create your account to get started</p>
        </div>
        <form (ngSubmit)="onSignup()" class="auth-form">
          <div class="form-group">
            <label>Organization Name</label>
            <input type="text" [(ngModel)]="orgName" name="orgName" placeholder="APN Enterprise" required>
          </div>
          <div class="form-group">
            <label>Full Name</label>
            <input type="text" [(ngModel)]="displayName" name="displayName" placeholder="John Doe" required>
          </div>
          <div class="form-group">
            <label>Email</label>
            <input type="email" [(ngModel)]="email" name="email" placeholder="you&#64;company.com" required>
          </div>
          <div class="form-group">
            <label>Password</label>
            <input type="password" [(ngModel)]="password" name="password" placeholder="Min 6 characters" required>
          </div>
          <div class="error" *ngIf="error">{{ error }}</div>
          <button type="submit" class="btn-primary" [disabled]="loading">
            {{ loading ? 'Creating...' : 'Create Account' }}
          </button>
        </form>
        <p class="auth-footer">
          Already have an account? <a routerLink="/login">Sign in</a>
        </p>
      </div>
    </div>
  `,
  styles: [`
    .auth-page { display: flex; justify-content: center; align-items: center; min-height: 80vh; }
    .auth-card { background: white; border-radius: 12px; padding: 40px; box-shadow: 0 4px 24px rgba(0,0,0,0.08); width: 100%; max-width: 400px; }
    .auth-header { text-align: center; margin-bottom: 32px; }
    .logo-img { height: 72px; width: auto; object-fit: contain; display: block; margin: 0 auto 16px auto; }
    .auth-header h1 { margin: 0; font-size: 32px; color: #1a202c; font-weight: 800; letter-spacing: -0.5px; }
    .tagline { color: #4f46e5; font-size: 15px; font-weight: 600; margin: 8px 0 16px 0; }
    .signup-text { color: #64748b; font-size: 14px; margin: 0; }
    .form-group { margin-bottom: 16px; }
    .form-group label { display: block; margin-bottom: 6px; font-weight: 500; color: #374151; font-size: 14px; }
    .form-group input { width: 100%; padding: 10px 14px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 15px; box-sizing: border-box; }
    .form-group input:focus { outline: none; border-color: #4f46e5; box-shadow: 0 0 0 3px rgba(79,70,229,0.1); }
    .btn-primary { width: 100%; padding: 12px; background: #4f46e5; color: white; border: none; border-radius: 8px; font-size: 15px; font-weight: 600; cursor: pointer; margin-top: 8px; }
    .btn-primary:hover { background: #4338ca; }
    .btn-primary:disabled { opacity: 0.6; }
    .error { color: #ef4444; font-size: 13px; margin-bottom: 8px; }
    .auth-footer { text-align: center; margin-top: 20px; color: #64748b; font-size: 14px; }
    .auth-footer a { color: #4f46e5; text-decoration: none; font-weight: 500; }
  `]
})
export class SignupComponent {
  orgName = '';
  displayName = '';
  email = '';
  password = '';
  error = '';
  loading = false;

  constructor(private auth: AuthService) {}

  async onSignup() {
    this.error = '';
    this.loading = true;
    try {
      await this.auth.signup(this.email, this.password, this.displayName, this.orgName);
    } catch (e: any) {
      this.error = e?.error?.error || 'Signup failed';
    } finally {
      this.loading = false;
    }
  }
}
