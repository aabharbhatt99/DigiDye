import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';

@Component({
  selector: 'app-directory',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="directory">
      <div class="page-header">
        <div>
          <a routerLink="/dashboard" class="back-link">← Dashboard</a>
          <h1>Color Directory</h1>
        </div>
        <button class="btn-primary" (click)="showAdd = true">+ Add Color</button>
      </div>

      <!-- Search -->
      <div class="filters-bar">
        <input type="text" [(ngModel)]="searchQuery" (ngModelChange)="onSearch()" placeholder="Search colors..." class="search-input">
        <select [(ngModel)]="categoryFilter" (ngModelChange)="onSearch()">
          <option value="">All Categories</option>
          <option *ngFor="let cat of categories" [value]="cat">{{ cat }}</option>
        </select>
      </div>

      <!-- Color Grid -->
      <div class="color-grid">
        <div class="color-card" *ngFor="let entry of entries">
          <div class="card-swatch" [style.background]="entry.color_hex"></div>
          <div class="card-info">
            <strong>{{ entry.name }}</strong>
            <span class="card-cat" *ngIf="entry.category">{{ entry.category }}</span>
            <span class="card-hex">{{ entry.color_hex }}</span>
          </div>
          <button class="btn-icon btn-delete" (click)="deleteEntry(entry.id)">×</button>
        </div>
      </div>

      <div class="empty-state" *ngIf="entries.length === 0 && !loading">
        <p>No colors saved yet. Add colors to your directory for quick reference.</p>
      </div>

      <!-- Add Color Modal -->
      <div class="modal-backdrop" *ngIf="showAdd" (click)="showAdd = false">
        <div class="modal" (click)="$event.stopPropagation()">
          <h2>Add Color to Directory</h2>
          <form (ngSubmit)="addEntry()">
            <div class="form-group">
              <label>Color Name</label>
              <input type="text" [(ngModel)]="newEntry.name" name="name" required placeholder="e.g. Navy Blue">
            </div>
            <div class="form-group">
              <label>Category</label>
              <input type="text" [(ngModel)]="newEntry.category" name="category" placeholder="e.g. Client A, Wedding Collection">
            </div>
            <div class="form-group">
              <label>Color</label>
              <div class="color-input-row">
                <input type="color" [(ngModel)]="newEntry.color_hex" name="color">
                <input type="text" [(ngModel)]="newEntry.color_hex" name="colorHex" class="hex-input">
              </div>
            </div>
            <div class="modal-actions">
              <button type="button" class="btn-secondary" (click)="showAdd = false">Cancel</button>
              <button type="submit" class="btn-primary">Add to Directory</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 20px; }
    .page-header h1 { margin: 8px 0 0; font-size: 24px; }
    .back-link { text-decoration: none; color: #64748b; font-size: 14px; }
    .btn-primary { padding: 10px 20px; background: #4f46e5; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; }
    .btn-secondary { padding: 10px 20px; background: #f1f5f9; color: #475569; border: none; border-radius: 8px; cursor: pointer; }
    .filters-bar { display: flex; gap: 12px; margin-bottom: 20px; }
    .search-input { flex: 1; padding: 10px 14px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px; }
    .filters-bar select { padding: 10px 14px; border: 1px solid #d1d5db; border-radius: 8px; }
    .color-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px; }
    .color-card {
      background: white; border-radius: 12px; overflow: hidden; position: relative;
      box-shadow: 0 2px 8px rgba(0,0,0,0.06); transition: transform 0.2s;
    }
    .color-card:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(0,0,0,0.1); }
    .card-swatch { height: 80px; }
    .card-info { padding: 12px; display: flex; flex-direction: column; gap: 4px; }
    .card-info strong { font-size: 14px; color: #1a202c; }
    .card-cat { font-size: 12px; color: #4f46e5; }
    .card-hex { font-size: 12px; color: #94a3b8; font-family: monospace; }
    .btn-icon { position: absolute; top: 8px; right: 8px; background: rgba(255,255,255,0.9); border: none; width: 24px; height: 24px; border-radius: 50%; cursor: pointer; font-size: 16px; line-height: 1; }
    .btn-icon:hover { background: #fee2e2; color: #ef4444; }
    .empty-state { text-align: center; color: #64748b; padding: 40px; }
    .modal-backdrop { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 100; }
    .modal { background: white; border-radius: 12px; padding: 32px; width: 100%; max-width: 420px; }
    .modal h2 { margin: 0 0 20px; }
    .form-group { margin-bottom: 16px; }
    .form-group label { display: block; margin-bottom: 6px; font-weight: 500; font-size: 14px; }
    .form-group input { width: 100%; padding: 10px 14px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px; box-sizing: border-box; }
    .color-input-row { display: flex; gap: 8px; }
    .color-input-row input[type="color"] { width: 40px; height: 38px; border: none; padding: 0; cursor: pointer; }
    .hex-input { flex: 1; }
    .modal-actions { display: flex; gap: 12px; justify-content: flex-end; margin-top: 24px; }
  `]
})
export class DirectoryComponent implements OnInit {
  profileId = '';
  entries: any[] = [];
  loading = true;
  searchQuery = '';
  categoryFilter = '';
  categories: string[] = [];
  showAdd = false;
  newEntry = { name: '', category: '', color_hex: '#4f46e5' };

  constructor(private route: ActivatedRoute, private api: ApiService) {}

  ngOnInit() {
    this.profileId = this.route.snapshot.paramMap.get('profileId')!;
    this.loadEntries();
  }

  loadEntries() {
    this.api.getDirectory(this.profileId).subscribe({
      next: (data) => {
        this.entries = data;
        this.categories = [...new Set(data.map((e: any) => e.category).filter(Boolean))];
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  onSearch() {
    this.api.searchDirectory(this.profileId, this.searchQuery, this.categoryFilter).subscribe(
      data => this.entries = data
    );
  }

  addEntry() {
    this.api.createDirectoryEntry(this.profileId, {
      name: this.newEntry.name,
      category: this.newEntry.category,
      color_hex: this.newEntry.color_hex,
      color_lab: { L: 50, a: 0, b: 0 },
    }).subscribe(() => {
      this.showAdd = false;
      this.newEntry = { name: '', category: '', color_hex: '#4f46e5' };
      this.loadEntries();
    });
  }

  deleteEntry(entryId: string) {
    if (confirm('Remove this color from directory?')) {
      this.api.deleteDirectoryEntry(this.profileId, entryId).subscribe(() => this.loadEntries());
    }
  }
}
