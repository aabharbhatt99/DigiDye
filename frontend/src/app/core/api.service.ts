import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Profiles
  getProfiles(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/profiles`);
  }

  createProfile(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/profiles`, data);
  }

  getProfile(id: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/profiles/${id}`);
  }

  updateProfile(id: string, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/profiles/${id}`, data);
  }

  deleteProfile(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/profiles/${id}`);
  }

  // Base Dyes
  getBaseDyes(profileId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/profiles/${profileId}/base-dyes`);
  }

  addBaseDye(profileId: string, data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/profiles/${profileId}/base-dyes`, data);
  }

  updateBaseDye(profileId: string, dyeId: string, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/profiles/${profileId}/base-dyes/${dyeId}`, data);
  }

  deleteBaseDye(profileId: string, dyeId: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/profiles/${profileId}/base-dyes/${dyeId}`);
  }

  // Recipes
  getRecipes(profileId: string, params?: any): Observable<any> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== '') {
          httpParams = httpParams.set(key, params[key]);
        }
      });
    }
    return this.http.get(`${this.baseUrl}/profiles/${profileId}/recipes`, { params: httpParams });
  }

  createRecipe(profileId: string, data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/profiles/${profileId}/recipes`, data);
  }

  getRecipe(profileId: string, recipeId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/profiles/${profileId}/recipes/${recipeId}`);
  }

  updateRecipe(profileId: string, recipeId: string, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/profiles/${profileId}/recipes/${recipeId}`, data);
  }

  deleteRecipe(profileId: string, recipeId: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/profiles/${profileId}/recipes/${recipeId}`);
  }

  duplicateRecipe(profileId: string, recipeId: string, name?: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/profiles/${profileId}/recipes/${recipeId}/duplicate`, { name });
  }

  importRecipes(profileId: string, csvContent: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/profiles/${profileId}/recipes/import`, { csv_content: csvContent });
  }

  getImportTemplate(profileId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/profiles/${profileId}/recipes/export-template`);
  }

  // Directory
  getDirectory(profileId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/profiles/${profileId}/directory`);
  }

  createDirectoryEntry(profileId: string, data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/profiles/${profileId}/directory`, data);
  }

  searchDirectory(profileId: string, query: string, category: string): Observable<any[]> {
    let params = new HttpParams();
    if (query) params = params.set('q', query);
    if (category) params = params.set('category', category);
    return this.http.get<any[]>(`${this.baseUrl}/profiles/${profileId}/directory/search`, { params });
  }

  deleteDirectoryEntry(profileId: string, entryId: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/profiles/${profileId}/directory/${entryId}`);
  }
}
