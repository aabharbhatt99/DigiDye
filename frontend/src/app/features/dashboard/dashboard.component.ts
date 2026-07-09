import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="dashboard">
      <div class="welcome-banner">
        <div class="welcome-text">
          <h2>Welcome to DyeMix</h2>
          <p>Dye Formulation - Simplified!</p>
        </div>
      </div>

      <div class="page-header">
        <h1>My Profiles</h1>
        <button class="btn-primary" (click)="showCreate = true">+ New Profile</button>
      </div>

      <!-- Create Profile Modal -->
      <div class="modal-backdrop" *ngIf="showCreate" (click)="showCreate = false">
        <div class="modal" (click)="$event.stopPropagation()">
          <h2>Create New Profile</h2>
          <form (ngSubmit)="createProfile()">
            <div class="form-group">
              <label>Profile Name</label>
              <input type="text" [(ngModel)]="newProfile.name" name="name" placeholder="e.g. Wool Dyeing - Acid Dyes" required>
            </div>
            <div class="form-group">
              <label>Material Type</label>
              <select [(ngModel)]="newProfile.material" name="material">
                <option>Wool</option><option>Silk</option><option>Cotton</option>
                <option>Polyester</option><option>Viscose</option><option>Nylon</option><option>Blended</option>
              </select>
            </div>
            <div class="form-group">
              <label>Dye Form</label>
              <select [(ngModel)]="newProfile.dye_form" name="dye_form">
                <option value="powder">Powder (mg)</option>
                <option value="liquid">Liquid (mL)</option>
              </select>
            </div>
            <div class="modal-actions">
              <button type="button" class="btn-secondary" (click)="showCreate = false">Cancel</button>
              <button type="submit" class="btn-primary">Create</button>
            </div>
          </form>
        </div>
      </div>

      <!-- Delete Profile Confirmation Modal -->
      <div class="modal-backdrop" *ngIf="profileToDelete" (click)="profileToDelete = null">
        <div class="modal" (click)="$event.stopPropagation()">
          <h2>Delete Profile</h2>
          <p>Are you sure you want to delete profile <strong>{{ profileToDelete.name }}</strong>?</p>
          <p class="modal-warning-text">This will delete all its recipes and directory entries. This action cannot be undone.</p>
          <div class="modal-actions">
            <button type="button" class="btn-secondary" (click)="profileToDelete = null">Cancel</button>
            <button type="button" class="btn-danger" (click)="confirmDeleteProfile()">Delete</button>
          </div>
        </div>
      </div>

      <!-- Profile Cards -->
      <div class="profile-grid">
        <div class="profile-card" *ngFor="let profile of profiles">
          <div class="card-color-bar" [style.background]="getGradient(profile)"></div>
          <button type="button" class="btn-delete-card" (click)="deleteProfile(profile, $event)" title="Delete Profile">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
            </svg>
          </button>
          <div class="card-body">
            <h3>{{ profile.name }}</h3>
            <div class="card-meta">
              <span class="badge">{{ profile.material }}</span>
              <span class="badge badge-form">{{ profile.dye_form }}</span>
            </div>
            <div class="card-actions">
              <button type="button" [routerLink]="['/profiles', profile.id, 'recipes']" class="btn-link">Recipes</button>
              <button type="button" [routerLink]="['/profiles', profile.id, 'directory']" class="btn-link">Directory</button>
              <button type="button" [routerLink]="['/profiles', profile.id, 'settings']" class="btn-link">Settings</button>
            </div>
          </div>
        </div>

        <div class="profile-card empty-card" *ngIf="profiles.length === 0 && !loading">
          <p>No profiles yet. Create your first profile to get started!</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard {
      position: relative;
      min-height: 80vh;
      z-index: 1;
    }
    .dashboard::before {
      content: "";
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-image: url('/assets/dyemix_logo_idea.png');
      background-repeat: no-repeat;
      background-position: center;
      background-size: 50% auto;
      opacity: 0.3;
      z-index: -1;
      pointer-events: none;
    }
    .welcome-banner {
      background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
      color: white;
      padding: 28px 32px;
      border-radius: 16px;
      margin-bottom: 28px;
      box-shadow: 0 4px 20px rgba(79, 70, 229, 0.15);
      position: relative;
      overflow: hidden;
    }
    .welcome-banner::after {
      content: '';
      position: absolute;
      top: -50%;
      right: -20%;
      width: 300px;
      height: 300px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.08);
      pointer-events: none;
    }
    .welcome-text h2 {
      margin: 0;
      font-size: 26px;
      font-weight: 700;
      letter-spacing: -0.5px;
    }
    .welcome-text p {
      margin: 8px 0 0;
      font-size: 16px;
      opacity: 0.9;
      font-weight: 400;
    }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .page-header h1 { margin: 0; font-size: 24px; color: #1a202c; }
    .btn-primary {
      padding: 10px 20px; background: #4f46e5; color: white; border: none;
      border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer;
    }
    .btn-primary:hover { background: #4338ca; }
    .btn-secondary { padding: 10px 20px; background: #f1f5f9; color: #475569; border: none; border-radius: 8px; cursor: pointer; font-weight: 500; }
    .btn-danger {
      padding: 10px 20px; background: #ef4444; color: white; border: none;
      border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer;
    }
    .btn-danger:hover { background: #dc2626; }
    .modal-warning-text { color: #ef4444; font-size: 14px; margin-top: 8px; font-weight: 500; }
    .profile-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px; }
    .profile-card {
      position: relative;
      background: white; border-radius: 12px; overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.06); transition: transform 0.2s, box-shadow 0.2s;
    }
    .btn-delete-card {
      position: absolute;
      top: 14px;
      right: 14px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 50%;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #94a3b8;
      cursor: pointer;
      transition: all 0.2s ease;
      padding: 0;
      z-index: 10;
    }
    .btn-delete-card:hover {
      background: #fee2e2;
      color: #ef4444;
      border-color: #fecaca;
      transform: scale(1.05);
    }
    .btn-delete-card svg {
      width: 16px;
      height: 16px;
      pointer-events: none;
    }
    .profile-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.1); }
    .card-color-bar { height: 6px; }
    .card-body { padding: 20px; }
    .card-body h3 { margin: 0 0 12px; font-size: 18px; color: #1a202c; }
    .card-meta { display: flex; gap: 8px; margin-bottom: 16px; }
    .badge {
      padding: 4px 10px; background: #eef2ff; color: #4f46e5; border-radius: 4px;
      font-size: 12px; font-weight: 600;
    }
    .badge-form { background: #f0fdf4; color: #166534; }
    .card-actions { display: flex; gap: 12px; }
    .btn-link {
      padding: 8px 12px;
      border: 1px solid #c7d2fe;
      border-radius: 8px;
      background: #eef2ff;
      color: #4338ca;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
    }
    .btn-link:hover { background: #e0e7ff; }
    .empty-card { display: flex; align-items: center; justify-content: center; min-height: 150px; }
    .empty-card p { color: #64748b; }
    .modal-backdrop {
      position: fixed; top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 100;
    }
    .modal { background: white; border-radius: 12px; padding: 32px; width: 100%; max-width: 450px; }
    .modal h2 { margin: 0 0 20px; font-size: 20px; }
    .form-group { margin-bottom: 16px; }
    .form-group label { display: block; margin-bottom: 6px; font-weight: 500; font-size: 14px; color: #374151; }
    .form-group input, .form-group select {
      width: 100%; padding: 10px 14px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 15px; box-sizing: border-box;
    }
    .modal-actions { display: flex; gap: 12px; justify-content: flex-end; margin-top: 24px; }
  `]
})
export class DashboardComponent implements OnInit {
  profiles: any[] = [];
  loading = true;
  showCreate = false;
  newProfile = { name: '', material: 'Wool', dye_form: 'powder' };
  profileToDelete: any = null;

  constructor(private readonly api: ApiService) { }

  ngOnInit() {
    this.loadProfiles();
  }

  loadProfiles() {
    this.api.getProfiles().subscribe({
      next: (data) => { this.profiles = data; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  createProfile() {
    this.api.createProfile(this.newProfile).subscribe({
      next: () => {
        this.showCreate = false;
        this.newProfile = { name: '', material: 'Wool', dye_form: 'powder' };
        this.loadProfiles();
      }
    });
  }

  deleteProfile(profile: any, event: Event) {
    event.stopPropagation();
    this.profileToDelete = profile;
  }

  confirmDeleteProfile() {
    if (!this.profileToDelete) return;
    this.api.deleteProfile(this.profileToDelete.id).subscribe({
      next: () => {
        this.profileToDelete = null;
        this.loadProfiles();
      },
      error: (err) => {
        console.error('deleteProfile API error:', err);
      }
    });
  }

  getGradient(profile: any): string {
    const colors = ['#4f46e5', '#7c3aed', '#ec4899', '#f59e0b'];
    const idx = this.profiles.indexOf(profile) % colors.length;
    return `linear-gradient(135deg, ${colors[idx]}, ${colors[(idx + 1) % colors.length]})`;
  }
}
