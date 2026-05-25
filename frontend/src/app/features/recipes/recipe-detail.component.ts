import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';

@Component({
  selector: 'app-recipe-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="recipe-detail" *ngIf="recipe">
      <div class="page-header">
        <div>
          <a [routerLink]="['/profiles', profileId, 'recipes']" class="back-link">← Back to Recipes</a>
          <h1>{{ recipe.name }}</h1>
        </div>
      </div>

      <div class="detail-grid">
        <!-- Color & Info Card -->
        <div class="section-card color-card">
          <div class="target-color-display">
            <div class="big-swatch" [style.background]="recipe.target_color_hex"></div>
            <div class="color-info">
              <div class="color-value"><strong>Hex:</strong> {{ recipe.target_color_hex }}</div>
              <div class="color-value"><strong>L*:</strong> {{ recipe.target_color_lab?.L | number:'1.1-1' }}</div>
              <div class="color-value"><strong>a*:</strong> {{ recipe.target_color_lab?.a | number:'1.1-1' }}</div>
              <div class="color-value"><strong>b*:</strong> {{ recipe.target_color_lab?.b | number:'1.1-1' }}</div>
            </div>
          </div>
          <div class="recipe-meta">
            <div class="meta-item"><span class="meta-label">Material</span><span class="meta-value">{{ recipe.material }}</span></div>
            <div class="meta-item"><span class="meta-label">Total Batch</span><span class="meta-value">{{ recipe.total_batch_weight_mg }} mg</span></div>
            <div class="meta-item" *ngIf="recipe.thread_weight_g"><span class="meta-label">Thread Weight</span><span class="meta-value">{{ recipe.thread_weight_g }} g</span></div>
            <div class="meta-item" *ngIf="recipe.liquor_ratio"><span class="meta-label">Liquor Ratio</span><span class="meta-value">{{ recipe.liquor_ratio }}</span></div>
            <div class="meta-item" *ngIf="recipe.water_volume_ml"><span class="meta-label">Water Volume</span><span class="meta-value">{{ recipe.water_volume_ml }} mL</span></div>
          </div>
        </div>

        <!-- Ingredients Card -->
        <div class="section-card">
          <h2>Dye Ingredients</h2>
          <div class="ingredient-list">
            <div class="ingredient-item" *ngFor="let ing of recipe.ingredients">
              <div class="ing-bar-container">
                <div class="ing-bar" [style.width.%]="ing.percentage" [style.background]="getIngColor(ing)"></div>
              </div>
              <div class="ing-details">
                <strong>{{ ing.base_dye_name || 'Dye' }}</strong>
                <span class="ing-qty">{{ ing.quantity_mg }} mg</span>
                <span class="ing-pct">{{ ing.percentage }}%</span>
              </div>
            </div>
          </div>

          <div class="no-data" *ngIf="recipe.ingredients.length === 0">
            No dye ingredients recorded.
          </div>
        </div>

        <!-- Auxiliaries Card -->
        <div class="section-card" *ngIf="recipe.auxiliaries.length > 0">
          <h2>Auxiliary Chemicals</h2>
          <table class="aux-table">
            <thead><tr><th>Chemical</th><th>Quantity</th><th>Purpose</th></tr></thead>
            <tbody>
              <tr *ngFor="let aux of recipe.auxiliaries">
                <td>{{ aux.name }}</td>
                <td>{{ aux.quantity_g }} {{ aux.unit }}</td>
                <td><span class="badge">{{ aux.purpose }}</span></td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Notes -->
        <div class="section-card" *ngIf="recipe.notes">
          <h2>Notes</h2>
          <p class="notes-text">{{ recipe.notes }}</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .back-link { text-decoration: none; color: #64748b; font-size: 14px; }
    .page-header { margin-bottom: 24px; }
    .page-header h1 { margin: 8px 0 0; font-size: 24px; }
    .detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    .section-card { background: white; border-radius: 12px; padding: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
    .section-card h2 { margin: 0 0 16px; font-size: 16px; color: #374151; }
    .color-card { grid-column: 1 / -1; }
    .target-color-display { display: flex; gap: 24px; margin-bottom: 20px; align-items: center; }
    .big-swatch { width: 100px; height: 100px; border-radius: 12px; border: 2px solid #e2e8f0; }
    .color-info { display: flex; flex-direction: column; gap: 6px; }
    .color-value { font-size: 14px; color: #374151; }
    .recipe-meta { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; }
    .meta-item { display: flex; flex-direction: column; gap: 2px; }
    .meta-label { font-size: 12px; color: #64748b; font-weight: 500; }
    .meta-value { font-size: 15px; color: #1a202c; font-weight: 600; }
    .ingredient-list { display: flex; flex-direction: column; gap: 12px; }
    .ingredient-item { }
    .ing-bar-container { height: 24px; background: #f1f5f9; border-radius: 6px; overflow: hidden; margin-bottom: 4px; }
    .ing-bar { height: 100%; border-radius: 6px; transition: width 0.5s; }
    .ing-details { display: flex; align-items: center; gap: 12px; }
    .ing-details strong { font-size: 14px; color: #1a202c; }
    .ing-qty { font-size: 13px; color: #64748b; }
    .ing-pct { font-size: 13px; color: #4f46e5; font-weight: 600; }
    .aux-table { width: 100%; border-collapse: collapse; }
    .aux-table th { text-align: left; padding: 8px 12px; font-size: 13px; color: #64748b; border-bottom: 1px solid #e2e8f0; }
    .aux-table td { padding: 8px 12px; font-size: 14px; border-bottom: 1px solid #f1f5f9; }
    .badge { padding: 3px 8px; background: #f0fdf4; color: #166534; border-radius: 4px; font-size: 12px; }
    .notes-text { color: #374151; line-height: 1.5; margin: 0; }
    .no-data { color: #94a3b8; font-size: 14px; text-align: center; padding: 20px; }
    @media (max-width: 768px) { .detail-grid { grid-template-columns: 1fr; } }
  `]
})
export class RecipeDetailComponent implements OnInit {
  profileId = '';
  recipeId = '';
  recipe: any = null;

  private dyeColors: Record<string, string> = {
    'Cyan': '#00BFFF', 'Magenta': '#FF00FF', 'Yellow': '#FFD700', 'Black': '#1A1A1A'
  };

  constructor(private route: ActivatedRoute, private api: ApiService) {}

  ngOnInit() {
    this.profileId = this.route.snapshot.paramMap.get('profileId')!;
    this.recipeId = this.route.snapshot.paramMap.get('recipeId')!;
    this.api.getRecipe(this.profileId, this.recipeId).subscribe(r => this.recipe = r);
  }

  getIngColor(ing: any): string {
    return this.dyeColors[ing.base_dye_name] || '#4f46e5';
  }
}
