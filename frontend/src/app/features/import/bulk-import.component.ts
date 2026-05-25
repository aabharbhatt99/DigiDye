import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';

@Component({
  selector: 'app-bulk-import',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="bulk-import">
      <div class="page-header">
        <div>
          <a [routerLink]="['/profiles', profileId, 'recipes']" class="back-link">← Back to Recipes</a>
          <h1>Bulk Import Recipes</h1>
        </div>
      </div>

      <div class="section-card">
        <h2>Import from CSV</h2>
        <p class="description">
          Upload a CSV file with your historical recipes. Download the template below to see the required format.
        </p>

        <button class="btn-secondary" (click)="downloadTemplate()">📥 Download CSV Template</button>

        <div class="upload-area" [class.dragover]="isDragover"
             (dragover)="onDragOver($event)" (dragleave)="isDragover = false" (drop)="onDrop($event)">
          <div class="upload-content">
            <span class="upload-icon">📄</span>
            <p>Drag & drop a CSV file here, or</p>
            <label class="file-label">
              <input type="file" accept=".csv" (change)="onFileSelect($event)" hidden>
              <span class="btn-primary">Browse Files</span>
            </label>
            <p class="file-hint" *ngIf="fileName">Selected: {{ fileName }}</p>
          </div>
        </div>

        <div class="csv-preview" *ngIf="csvContent">
          <h3>Preview (first 5 lines)</h3>
          <pre>{{ csvPreview }}</pre>
        </div>

        <button class="btn-primary btn-import" *ngIf="csvContent" (click)="importRecipes()" [disabled]="importing">
          {{ importing ? 'Importing...' : 'Import Recipes' }}
        </button>
      </div>

      <!-- Import Results -->
      <div class="section-card results-card" *ngIf="importResult">
        <h2>Import Results</h2>
        <div class="result-stats">
          <div class="stat stat-total"><span class="stat-num">{{ importResult.total_rows }}</span><span class="stat-label">Total Rows</span></div>
          <div class="stat stat-success"><span class="stat-num">{{ importResult.imported }}</span><span class="stat-label">Imported</span></div>
          <div class="stat stat-error"><span class="stat-num">{{ importResult.skipped }}</span><span class="stat-label">Skipped</span></div>
        </div>

        <div class="errors-list" *ngIf="importResult.errors.length > 0">
          <h3>Errors</h3>
          <div class="error-item" *ngFor="let err of importResult.errors">
            <span class="error-row">Row {{ err.row }}</span>
            <span class="error-msg">{{ err.error }}</span>
          </div>
        </div>

        <a [routerLink]="['/profiles', profileId, 'recipes']" class="btn-primary" style="display:inline-block; text-decoration:none; margin-top: 16px;">
          View Recipes →
        </a>
      </div>
    </div>
  `,
  styles: [`
    .page-header { margin-bottom: 24px; }
    .page-header h1 { margin: 8px 0 0; font-size: 24px; }
    .back-link { text-decoration: none; color: #64748b; font-size: 14px; }
    .section-card { background: white; border-radius: 12px; padding: 24px; margin-bottom: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
    .section-card h2 { margin: 0 0 12px; font-size: 18px; }
    .description { color: #64748b; margin-bottom: 16px; }
    .btn-primary { padding: 10px 20px; background: #4f46e5; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; }
    .btn-secondary { padding: 10px 20px; background: #f1f5f9; color: #475569; border: none; border-radius: 8px; cursor: pointer; font-weight: 500; margin-bottom: 20px; }
    .upload-area {
      border: 2px dashed #d1d5db; border-radius: 12px; padding: 40px;
      text-align: center; margin: 20px 0; transition: all 0.2s;
    }
    .upload-area.dragover { border-color: #4f46e5; background: #eef2ff; }
    .upload-icon { font-size: 40px; display: block; margin-bottom: 12px; }
    .upload-content p { color: #64748b; margin: 8px 0; }
    .file-label { cursor: pointer; }
    .file-hint { color: #166534; font-weight: 500; }
    .csv-preview { margin-top: 20px; }
    .csv-preview h3 { font-size: 14px; color: #374151; margin-bottom: 8px; }
    .csv-preview pre { background: #f8fafc; padding: 12px; border-radius: 8px; font-size: 12px; overflow-x: auto; white-space: pre-wrap; word-break: break-all; }
    .btn-import { margin-top: 16px; }
    .btn-import:disabled { opacity: 0.6; }
    .results-card { }
    .result-stats { display: flex; gap: 20px; margin-bottom: 20px; }
    .stat { display: flex; flex-direction: column; align-items: center; padding: 16px 24px; border-radius: 8px; }
    .stat-total { background: #f1f5f9; }
    .stat-success { background: #f0fdf4; }
    .stat-error { background: #fef2f2; }
    .stat-num { font-size: 28px; font-weight: 700; }
    .stat-success .stat-num { color: #166534; }
    .stat-error .stat-num { color: #dc2626; }
    .stat-label { font-size: 12px; color: #64748b; margin-top: 4px; }
    .errors-list { margin-top: 16px; }
    .errors-list h3 { font-size: 14px; margin-bottom: 8px; }
    .error-item { display: flex; gap: 12px; padding: 8px 12px; border-bottom: 1px solid #f1f5f9; font-size: 13px; }
    .error-row { font-weight: 600; color: #dc2626; min-width: 60px; }
    .error-msg { color: #374151; }
  `]
})
export class BulkImportComponent implements OnInit {
  profileId = '';
  csvContent = '';
  csvPreview = '';
  fileName = '';
  isDragover = false;
  importing = false;
  importResult: any = null;

  constructor(private route: ActivatedRoute, private api: ApiService) {}

  ngOnInit() {
    this.profileId = this.route.snapshot.paramMap.get('profileId')!;
  }

  downloadTemplate() {
    this.api.getImportTemplate(this.profileId).subscribe((res) => {
      const blob = new Blob([res.template], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'dyemix_import_template.csv';
      a.click();
      URL.revokeObjectURL(url);
    });
  }

  onFileSelect(event: any) {
    const file = event.target.files[0];
    if (file) this.readFile(file);
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragover = true;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragover = false;
    const file = event.dataTransfer?.files[0];
    if (file) this.readFile(file);
  }

  private readFile(file: File) {
    this.fileName = file.name;
    const reader = new FileReader();
    reader.onload = (e) => {
      this.csvContent = e.target?.result as string;
      const lines = this.csvContent.split('\n').slice(0, 6);
      this.csvPreview = lines.join('\n');
    };
    reader.readAsText(file);
  }

  importRecipes() {
    this.importing = true;
    this.api.importRecipes(this.profileId, this.csvContent).subscribe({
      next: (result) => { this.importResult = result; this.importing = false; },
      error: () => { this.importing = false; }
    });
  }
}
