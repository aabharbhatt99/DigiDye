import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';

@Component({
  selector: 'app-recipe-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="recipe-list">
      <div class="page-header">
        <div>
          <h1>Recipes</h1>
        </div>
        <div class="header-actions">
          <a [routerLink]="['/profiles', profileId, 'recipes', 'import']" class="btn-secondary">📥 Import CSV</a>
          <button class="btn-primary" (click)="showCreate = true">+ New Recipe</button>
        </div>
      </div>

      <!-- Search & Filters -->
      <div class="filters-bar">
        <input type="text" [(ngModel)]="searchQuery" (ngModelChange)="onSearch()" placeholder="Search recipes..." class="search-input">
        <select [(ngModel)]="sortBy" (ngModelChange)="loadRecipes()">
          <option value="created_at">Date Created</option>
          <option value="name">Name</option>
          <option value="material">Material</option>
        </select>
        <select [(ngModel)]="sortOrder" (ngModelChange)="loadRecipes()">
          <option value="desc">Newest First</option>
          <option value="asc">Oldest First</option>
        </select>
      </div>

      <!-- Recipe Table -->
      <div class="table-card">
        <table class="recipe-table">
          <thead>
            <tr>
              <th>Color</th>
              <th>Recipe Name</th>
              <th>Material</th>
              <th>Batch Size</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let recipe of recipes" class="recipe-row">
              <td>
                <div class="color-swatch" [style.background]="recipe.target_color_hex"></div>
              </td>
              <td>
                <a [routerLink]="['/profiles', profileId, 'recipes', recipe.id]" class="recipe-name">{{ recipe.name }}</a>
              </td>
              <td><span class="badge">{{ recipe.material }}</span></td>
              <td>{{ recipe.total_batch_weight_mg }} mg</td>
              <td>{{ recipe.created_at | date:'mediumDate' }}</td>
              <td>
                <div class="row-actions">
                  <button class="btn-icon" title="Duplicate" (click)="duplicate(recipe.id)">📋</button>
                  <button class="btn-icon btn-delete" title="Delete" (click)="deleteRecipe(recipe.id)">🗑️</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <div class="empty-state" *ngIf="recipes.length === 0 && !loading">
          <p>No recipes found. Create your first recipe or import from CSV.</p>
        </div>

        <!-- Pagination -->
        <div class="pagination" *ngIf="totalPages > 1">
          <button (click)="goToPage(page - 1)" [disabled]="page <= 1">← Prev</button>
          <span>Page {{ page }} of {{ totalPages }}</span>
          <button (click)="goToPage(page + 1)" [disabled]="page >= totalPages">Next →</button>
        </div>
      </div>

      <!-- Create Recipe Modal -->
      <div class="modal-backdrop" *ngIf="showCreate" (click)="showCreate = false">
        <div class="modal modal-lg" (click)="$event.stopPropagation()">
          <h2>Create New Recipe</h2>
          <form (ngSubmit)="createRecipe()">
            <div class="form-row">
              <div class="form-group">
                <label>Recipe Name</label>
                <input type="text" [(ngModel)]="newRecipe.name" name="name" required>
              </div>
              <div class="form-group">
                <label>Target Color</label>
                <div class="color-input-row">
                  <input type="color" [(ngModel)]="newRecipe.target_color_hex" name="color">
                  <input type="text" [(ngModel)]="newRecipe.target_color_hex" name="colorHex" class="hex-input">
                </div>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Material</label>
                <select [(ngModel)]="newRecipe.material" name="material">
                  <option>Wool</option><option>Silk</option><option>Cotton</option><option>Polyester</option>
                </select>
              </div>
              <div class="form-group">
                <label>Total Batch (mg)</label>
                <input type="number" [(ngModel)]="newRecipe.total_batch_weight_mg" name="batch">
              </div>
              <div class="form-group">
                <label>Thread Weight (g)</label>
                <input type="number" [(ngModel)]="newRecipe.thread_weight_g" name="thread">
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Liquor Ratio</label>
                <input type="text" [(ngModel)]="newRecipe.liquor_ratio" name="liquor" placeholder="1:20">
              </div>
              <div class="form-group">
                <label>Water Volume (mL)</label>
                <input type="number" [(ngModel)]="newRecipe.water_volume_ml" name="water">
              </div>
            </div>
            <div class="form-group">
              <label>Notes</label>
              <textarea [(ngModel)]="newRecipe.notes" name="notes" rows="2"></textarea>
            </div>
            <div class="modal-actions">
              <button type="button" class="btn-secondary" (click)="showCreate = false">Cancel</button>
              <button type="submit" class="btn-primary">Create Recipe</button>
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
    .header-actions { display: flex; gap: 12px; }
    .btn-primary { padding: 10px 20px; background: #4f46e5; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 14px; }
    .btn-secondary { padding: 10px 20px; background: #f1f5f9; color: #475569; border: none; border-radius: 8px; cursor: pointer; font-weight: 500; text-decoration: none; font-size: 14px; }
    .filters-bar { display: flex; gap: 12px; margin-bottom: 16px; }
    .search-input { flex: 1; padding: 10px 14px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px; }
    .filters-bar select { padding: 10px 14px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px; }
    .table-card { background: white; border-radius: 12px; padding: 0; box-shadow: 0 2px 8px rgba(0,0,0,0.06); overflow: hidden; }
    .recipe-table { width: 100%; border-collapse: collapse; }
    .recipe-table th { padding: 12px 16px; text-align: left; font-size: 13px; font-weight: 600; color: #64748b; background: #f8fafc; border-bottom: 1px solid #e2e8f0; }
    .recipe-table td { padding: 12px 16px; border-bottom: 1px solid #f1f5f9; }
    .recipe-row:hover { background: #f8fafc; }
    .color-swatch { width: 32px; height: 32px; border-radius: 6px; border: 1px solid #e2e8f0; }
    .recipe-name { color: #1a202c; text-decoration: none; font-weight: 500; }
    .recipe-name:hover { color: #4f46e5; }
    .badge { padding: 3px 8px; background: #eef2ff; color: #4f46e5; border-radius: 4px; font-size: 12px; font-weight: 500; }
    .row-actions { display: flex; gap: 4px; }
    .btn-icon { background: none; border: none; cursor: pointer; font-size: 16px; padding: 4px 8px; border-radius: 4px; }
    .btn-icon:hover { background: #f1f5f9; }
    .empty-state { padding: 40px; text-align: center; color: #64748b; }
    .pagination { display: flex; align-items: center; justify-content: center; gap: 16px; padding: 16px; }
    .pagination button { padding: 8px 16px; border: 1px solid #d1d5db; border-radius: 6px; background: white; cursor: pointer; }
    .pagination button:disabled { opacity: 0.5; cursor: not-allowed; }
    .modal-backdrop { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 100; }
    .modal { background: white; border-radius: 12px; padding: 32px; width: 100%; max-width: 450px; max-height: 80vh; overflow-y: auto; }
    .modal-lg { max-width: 600px; }
    .modal h2 { margin: 0 0 20px; }
    .form-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 12px; }
    .form-group { margin-bottom: 12px; }
    .form-group label { display: block; margin-bottom: 4px; font-weight: 500; font-size: 13px; color: #374151; }
    .form-group input, .form-group select, .form-group textarea { width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; box-sizing: border-box; }
    .color-input-row { display: flex; gap: 8px; }
    .color-input-row input[type="color"] { width: 40px; height: 36px; border: none; padding: 0; cursor: pointer; }
    .hex-input { flex: 1; }
    .modal-actions { display: flex; gap: 12px; justify-content: flex-end; margin-top: 20px; }
  `]
})
export class RecipeListComponent implements OnInit {
  profileId = '';
  recipes: any[] = [];
  loading = true;
  searchQuery = '';
  sortBy = 'created_at';
  sortOrder = 'desc';
  page = 1;
  totalPages = 1;
  showCreate = false;
  newRecipe: any = {
    name: '', target_color_hex: '#003366', material: 'Wool',
    total_batch_weight_mg: 1000, thread_weight_g: 10,
    liquor_ratio: '1:20', water_volume_ml: 200, notes: ''
  };

  constructor(private route: ActivatedRoute, private api: ApiService) {}

  ngOnInit() {
    this.profileId = this.route.snapshot.paramMap.get('profileId')!;
    this.loadRecipes();
  }

  loadRecipes() {
    this.api.getRecipes(this.profileId, {
      page: this.page, per_page: 20,
      sort_by: this.sortBy, sort_order: this.sortOrder,
      search: this.searchQuery
    }).subscribe({
      next: (res) => { this.recipes = res.recipes; this.totalPages = res.total_pages; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  onSearch() {
    this.page = 1;
    this.loadRecipes();
  }

  goToPage(p: number) {
    this.page = p;
    this.loadRecipes();
  }

  createRecipe() {
    this.api.createRecipe(this.profileId, this.newRecipe).subscribe(() => {
      this.showCreate = false;
      this.loadRecipes();
    });
  }

  duplicate(recipeId: string) {
    this.api.duplicateRecipe(this.profileId, recipeId).subscribe(() => this.loadRecipes());
  }

  deleteRecipe(recipeId: string) {
    if (confirm('Delete this recipe?')) {
      this.api.deleteRecipe(this.profileId, recipeId).subscribe(() => this.loadRecipes());
    }
  }
}
