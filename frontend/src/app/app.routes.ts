import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'signup',
    loadComponent: () => import('./features/auth/signup.component').then(m => m.SignupComponent)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard]
  },
  {
    path: 'profiles/:profileId',
    loadComponent: () => import('./features/profile/profile-settings.component').then(m => m.ProfileSettingsComponent),
    canActivate: [authGuard]
  },
  {
    path: 'profiles/:profileId/recipes',
    loadComponent: () => import('./features/recipes/recipe-list.component').then(m => m.RecipeListComponent),
    canActivate: [authGuard]
  },
  {
    path: 'profiles/:profileId/recipes/:recipeId',
    loadComponent: () => import('./features/recipes/recipe-detail.component').then(m => m.RecipeDetailComponent),
    canActivate: [authGuard]
  },
  {
    path: 'profiles/:profileId/directory',
    loadComponent: () => import('./features/directory/directory.component').then(m => m.DirectoryComponent),
    canActivate: [authGuard]
  },
  {
    path: 'profiles/:profileId/import',
    loadComponent: () => import('./features/import/bulk-import.component').then(m => m.BulkImportComponent),
    canActivate: [authGuard]
  },
  { path: '**', redirectTo: '/dashboard' }
];
