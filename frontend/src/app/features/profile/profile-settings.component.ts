import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';

@Component({
  selector: 'app-profile-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="profile-settings" *ngIf="profile">
      <div class="page-header">
        <div>
          <button type="button" routerLink="/dashboard" class="back-link">← Back to Dashboard</button>
          <h1>{{ profile.name }}</h1>
        </div>
      </div>

      <!-- Profile Info -->
      <div class="section-card">
        <h2>Profile Settings</h2>
        <form (ngSubmit)="saveProfile()">
          <div class="form-row">
            <div class="form-group">
              <label>Name</label>
              <input type="text" [(ngModel)]="profile.name" name="name">
            </div>
            <div class="form-group">
              <label>Material</label>
              <select [(ngModel)]="profile.material" name="material">
                <option>Wool</option><option>Silk</option><option>Cotton</option>
                <option>Polyester</option><option>Viscose</option><option>Nylon</option>
              </select>
            </div>
            <div class="form-group">
              <label>Dye Form</label>
              <select [(ngModel)]="profile.dye_form" name="dye_form">
                <option value="powder">Powder (mg)</option>
                <option value="liquid">Liquid (mL)</option>
              </select>
            </div>
          </div>
          <button type="submit" class="btn-primary">Save Changes</button>
        </form>
      </div>

      <!-- Base Dyes -->
      <div class="section-card">
        <div class="section-header">
          <h2>Base Dyes ({{ baseDyes.length }}/8)</h2>
          <button class="btn-primary btn-sm" (click)="showAddDye = true" [disabled]="baseDyes.length >= 8">+ Add Dye</button>
        </div>

        <div class="dye-grid">
          <div class="dye-card" *ngFor="let dye of baseDyes">
            <div class="dye-swatch" [style.background]="dye.color_hex"></div>
            <div class="dye-info">
              <strong>{{ dye.name }}</strong>
              <span class="dye-ci" *ngIf="dye.ci_number">{{ dye.ci_number }}</span>
              <span class="dye-hex">{{ dye.color_hex }}</span>
              <span class="dye-form-badge">{{ dye.form }}</span>
            </div>
            <button class="btn-icon btn-delete" (click)="deleteDye(dye.id)">×</button>
          </div>
        </div>

        <!-- Add Dye Form -->
        <div class="add-dye-form" *ngIf="showAddDye">
          <h3>Add Base Dye</h3>
          <div class="form-row">
            <div class="form-group">
              <label>Name</label>
              <input type="text" [(ngModel)]="newDye.name" placeholder="e.g. Cyan">
            </div>
            <div class="form-group">
              <label>CI Number</label>
              <input type="text" [(ngModel)]="newDye.ci_number" placeholder="e.g. CI 74160">
            </div>
            <div class="form-group">
              <label>Color</label>
              <div class="color-input-row">
                <input type="color" [(ngModel)]="newDye.color_hex" class="color-picker">
                <input type="text" [(ngModel)]="newDye.color_hex" class="hex-input" placeholder="#00BFFF">
              </div>
            </div>
          </div>
          <div class="form-actions">
            <button class="btn-secondary" (click)="showAddDye = false">Cancel</button>
            <button class="btn-primary" (click)="addDye()">Add Dye</button>
          </div>
        </div>
      </div>

      <!-- Quick Links -->
      <div class="section-card">
        <h2>Quick Actions</h2>
        <div class="quick-actions">
          <button type="button" [routerLink]="['/profiles', profileId, 'recipes']" class="action-card">
            <span class="action-icon">📋</span>
            <span>View Recipes</span>
          </button>
          <button type="button" [routerLink]="['/profiles', profileId, 'directory']" class="action-card">
            <span class="action-icon">🎨</span>
            <span>Color Directory</span>
          </button>
          <button type="button" [routerLink]="['/profiles', profileId, 'import']" class="action-card">
            <span class="action-icon">📥</span>
            <span>Bulk Import</span>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .back-link {
      padding: 0;
      border: none;
      background: transparent;
      color: #64748b;
      font-size: 14px;
      cursor: pointer;
    }
    .back-link:hover { color: #4f46e5; }
    .page-header { margin-bottom: 24px; }
    .page-header h1 { margin: 8px 0 0; font-size: 24px; color: #1a202c; }
    .section-card { background: white; border-radius: 12px; padding: 24px; margin-bottom: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
    .section-card h2 { margin: 0 0 16px; font-size: 18px; color: #1a202c; }
    .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .section-header h2 { margin: 0; }
    .form-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; }
    .form-group { margin-bottom: 16px; }
    .form-group label { display: block; margin-bottom: 6px; font-weight: 500; font-size: 14px; color: #374151; }
    .form-group input, .form-group select { width: 100%; padding: 10px 14px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px; box-sizing: border-box; }
    .btn-primary { padding: 10px 20px; background: #4f46e5; color: white; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; }
    .btn-primary:hover { background: #4338ca; }
    .btn-sm { padding: 8px 14px; font-size: 13px; }
    .btn-secondary { padding: 10px 20px; background: #f1f5f9; color: #475569; border: none; border-radius: 8px; cursor: pointer; font-weight: 500; }
    .dye-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 12px; }
    .dye-card { display: flex; align-items: center; gap: 12px; padding: 12px; border: 1px solid #e2e8f0; border-radius: 8px; position: relative; }
    .dye-swatch { width: 40px; height: 40px; border-radius: 8px; border: 1px solid #e2e8f0; flex-shrink: 0; }
    .dye-info { display: flex; flex-direction: column; gap: 2px; }
    .dye-info strong { font-size: 14px; color: #1a202c; }
    .dye-ci { font-size: 12px; color: #64748b; }
    .dye-hex { font-size: 12px; color: #94a3b8; font-family: monospace; }
    .dye-form-badge { font-size: 11px; color: #166534; background: #f0fdf4; padding: 2px 6px; border-radius: 3px; width: fit-content; }
    .btn-icon { position: absolute; top: 8px; right: 8px; background: none; border: none; font-size: 20px; cursor: pointer; color: #94a3b8; }
    .btn-icon:hover { color: #ef4444; }
    .add-dye-form { margin-top: 16px; padding: 16px; border: 1px solid #e2e8f0; border-radius: 8px; background: #f8fafc; }
    .add-dye-form h3 { margin: 0 0 12px; font-size: 15px; }
    .color-input-row { display: flex; gap: 8px; align-items: center; }
    .color-picker { width: 40px; height: 38px; border: none; padding: 0; cursor: pointer; border-radius: 6px; }
    .hex-input { flex: 1; }
    .form-actions { display: flex; gap: 12px; margin-top: 16px; }
    .quick-actions { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; }
    .action-card {
      display: flex; flex-direction: column; align-items: center; gap: 8px;
      padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;
      background: #ffffff;
      color: #374151;
      cursor: pointer;
      transition: all 0.2s;
    }
    .action-card:hover { border-color: #4f46e5; background: #eef2ff; }
    .action-icon { font-size: 28px; }
  `]
})
export class ProfileSettingsComponent implements OnInit {
  profileId = '';
  profile: any = null;
  baseDyes: any[] = [];
  showAddDye = false;
  newDye = { name: '', ci_number: '', color_hex: '#00BFFF', form: 'powder' };

  constructor(private readonly route: ActivatedRoute, private readonly api: ApiService) {}

  ngOnInit() {
    this.profileId = this.route.snapshot.paramMap.get('profileId')!;
    this.loadProfile();
    this.loadDyes();
  }

  loadProfile() {
    this.api.getProfile(this.profileId).subscribe(p => this.profile = p);
  }

  loadDyes() {
    this.api.getBaseDyes(this.profileId).subscribe(d => this.baseDyes = d);
  }

  saveProfile() {
    this.api.updateProfile(this.profileId, {
      name: this.profile.name,
      material: this.profile.material,
      dye_form: this.profile.dye_form,
    }).subscribe();
  }

  addDye() {
    this.api.addBaseDye(this.profileId, {
      name: this.newDye.name,
      ci_number: this.newDye.ci_number,
      color_hex: this.newDye.color_hex,
      color_lab: { L: 50, a: 0, b: 0 },
      form: this.newDye.form,
    }).subscribe(() => {
      this.showAddDye = false;
      this.newDye = { name: '', ci_number: '', color_hex: '#00BFFF', form: 'powder' };
      this.loadDyes();
    });
  }

  deleteDye(dyeId: string) {
    if (confirm('Delete this base dye?')) {
      this.api.deleteBaseDye(this.profileId, dyeId).subscribe(() => this.loadDyes());
    }
  }
}
