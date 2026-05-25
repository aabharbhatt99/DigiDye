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

      <!-- Profile Cards -->
      <div class="profile-grid">
        <div class="profile-card" *ngFor="let profile of profiles">
          <div class="card-color-bar" [style.background]="getGradient(profile)"></div>
          <div class="card-body">
            <h3>{{ profile.name }}</h3>
            <div class="card-meta">
              <span class="badge">{{ profile.material }}</span>
              <span class="badge badge-form">{{ profile.dye_form }}</span>
            </div>
            <div class="card-actions">
              <button type="button" [routerLink]="['/profiles', profile.id, 'recipes']" class="btn-link">Recipes</button>
              <button type="button" [routerLink]="['/profiles', profile.id, 'directory']" class="btn-link">Directory</button>
              <button type="button" [routerLink]="['/profiles', profile.id]" class="btn-link">Settings</button>
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
    .dashboard { }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .page-header h1 { margin: 0; font-size: 24px; color: #1a202c; }
    .btn-primary {
      padding: 10px 20px; background: #4f46e5; color: white; border: none;
      border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer;
    }
    .btn-primary:hover { background: #4338ca; }
    .btn-secondary { padding: 10px 20px; background: #f1f5f9; color: #475569; border: none; border-radius: 8px; cursor: pointer; font-weight: 500; }
    .profile-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px; }
    .profile-card {
      background: white; border-radius: 12px; overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.06); transition: transform 0.2s, box-shadow 0.2s;
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

  constructor(private readonly api: ApiService) {}

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

  getGradient(profile: any): string {
    const colors = ['#4f46e5', '#7c3aed', '#ec4899', '#f59e0b'];
    const idx = this.profiles.indexOf(profile) % colors.length;
    return `linear-gradient(135deg, ${colors[idx]}, ${colors[(idx + 1) % colors.length]})`;
  }
}
