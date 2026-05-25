import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

export interface User {
  id: string;
  email: string;
  display_name: string;
  tenant_id: string;
  role: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _user = signal<User | null>(null);
  private _token = signal<string | null>(null);

  currentUser = computed(() => this._user());
  token = computed(() => this._token());

  constructor(private http: HttpClient, private router: Router) {
    // Restore session
    const saved = localStorage.getItem('dyemix_auth');
    if (saved) {
      const data = JSON.parse(saved);
      this._token.set(data.token);
      this._user.set(data.user);
    }
  }

  isLoggedIn(): boolean {
    return !!this._token();
  }

  async login(email: string, password: string): Promise<void> {
    const res: any = await this.http.post(`${environment.apiUrl}/auth/login`, { email, password }).toPromise();
    this._token.set(res.access_token);
    this._user.set(res.user);
    localStorage.setItem('dyemix_auth', JSON.stringify({ token: res.access_token, user: res.user }));
    this.router.navigate(['/dashboard']);
  }

  async signup(email: string, password: string, displayName: string, orgName: string): Promise<void> {
    const res: any = await this.http.post(`${environment.apiUrl}/auth/signup`, {
      email, password, display_name: displayName, org_name: orgName
    }).toPromise();
    this._token.set(res.access_token);
    this._user.set(res.user);
    localStorage.setItem('dyemix_auth', JSON.stringify({ token: res.access_token, user: res.user }));
    this.router.navigate(['/dashboard']);
  }

  logout(): void {
    this._token.set(null);
    this._user.set(null);
    localStorage.removeItem('dyemix_auth');
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return this._token();
  }
}
