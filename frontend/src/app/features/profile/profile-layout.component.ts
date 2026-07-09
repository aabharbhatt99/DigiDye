import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ApiService } from '../../core/api.service';

@Component({
  selector: 'app-profile-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <div class="profile-layout" *ngIf="profile">
      <!-- Profile Header / Title Area -->
      <div class="profile-header-strip">
        <div class="header-left">
          <a routerLink="/dashboard" class="btn-back-dashboard">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="back-icon">
              <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
            Dashboard
          </a>
          <div class="profile-title-container">
            <div class="profile-avatar" [style.background]="getAvatarGradient()">
              {{ profile.name.substring(0, 2).toUpperCase() }}
            </div>
            <div>
              <h1 class="profile-name">{{ profile.name }}</h1>
              <div class="profile-meta-tags">
                <span class="meta-tag material-tag">{{ profile.material }}</span>
                <span class="meta-tag form-tag">{{ profile.dye_form }}</span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Premium Tab Strip -->
        <div class="tab-strip">
          <a [routerLink]="['/profiles', profileId, 'recipes']"
             routerLinkActive="active"
             [routerLinkActiveOptions]="{ exact: false }"
             class="tab-item">
            <span class="tab-icon">📋</span>
            <span class="tab-label">Recipes</span>
          </a>
          <a [routerLink]="['/profiles', profileId, 'directory']"
             routerLinkActive="active"
             class="tab-item">
            <span class="tab-icon">🎨</span>
            <span class="tab-label">Color Directory</span>
          </a>
          <a [routerLink]="['/profiles', profileId, 'settings']"
             routerLinkActive="active"
             class="tab-item">
            <span class="tab-icon">⚙️</span>
            <span class="tab-label">Settings</span>
          </a>
        </div>
      </div>

      <!-- Main Profile Sub-View (Child Route Content) -->
      <div class="profile-content-area">
        <router-outlet></router-outlet>
      </div>
    </div>
  `,
  styles: [`
    .profile-layout {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }
    .profile-header-strip {
      background: white;
      border-radius: 16px;
      padding: 24px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.04);
      border: 1px solid #e2e8f0;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    @media (min-width: 992px) {
      .profile-header-strip {
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
      }
    }
    .header-left {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    @media (min-width: 640px) {
      .header-left {
        flex-direction: row;
        align-items: center;
        gap: 24px;
      }
    }
    .btn-back-dashboard {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      background: #f8fafc;
      color: #64748b;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      text-decoration: none;
      font-size: 14px;
      font-weight: 600;
      transition: all 0.2s ease;
      width: fit-content;
    }
    .btn-back-dashboard:hover {
      background: #f1f5f9;
      color: #1e293b;
      border-color: #cbd5e1;
    }
    .back-icon {
      width: 16px;
      height: 16px;
    }
    .profile-title-container {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .profile-avatar {
      width: 52px;
      height: 52px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 700;
      font-size: 18px;
      letter-spacing: 0.5px;
      box-shadow: 0 4px 10px rgba(79, 70, 229, 0.2);
    }
    .profile-name {
      margin: 0;
      font-size: 22px;
      font-weight: 700;
      color: #0f172a;
    }
    .profile-meta-tags {
      display: flex;
      gap: 8px;
      margin-top: 4px;
    }
    .meta-tag {
      font-size: 11px;
      font-weight: 600;
      padding: 2px 8px;
      border-radius: 6px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .material-tag {
      background: #eef2ff;
      color: #4f46e5;
    }
    .form-tag {
      background: #f0fdf4;
      color: #166534;
    }
    
    /* Tab Strip Styling */
    .tab-strip {
      display: flex;
      background: #f1f5f9;
      padding: 6px;
      border-radius: 12px;
      gap: 4px;
      width: 100%;
    }
    @media (min-width: 992px) {
      .tab-strip {
        width: auto;
      }
    }
    .tab-item {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 10px 18px;
      border-radius: 8px;
      text-decoration: none;
      color: #64748b;
      font-weight: 600;
      font-size: 14px;
      transition: all 0.2s ease;
      cursor: pointer;
    }
    @media (min-width: 992px) {
      .tab-item {
        flex: none;
      }
    }
    .tab-item:hover {
      color: #0f172a;
      background: rgba(255, 255, 255, 0.5);
    }
    .tab-item.active {
      color: #4f46e5;
      background: white;
      box-shadow: 0 4px 10px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.02);
    }
    .tab-icon {
      font-size: 16px;
    }
    
    .profile-content-area {
      min-height: 400px;
    }
  `]
})
export class ProfileLayoutComponent implements OnInit {
  profileId = '';
  profile: any = null;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly api: ApiService
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.profileId = params.get('profileId')!;
      this.loadProfile();
    });
  }

  loadProfile() {
    this.api.getProfile(this.profileId).subscribe(p => this.profile = p);
  }

  getAvatarGradient(): string {
    return 'linear-gradient(135deg, #4f46e5, #7c3aed)';
  }
}
