import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import Keycloak from 'keycloak-js';
import { BehaviorSubject, from, Observable, firstValueFrom, switchMap, tap } from 'rxjs';
import { StoreUser, UpdateProfileRequest } from '../models/store-user.model';

interface KeycloakTokenResponse {
  access_token: string;
  refresh_token: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {

  private readonly apiUrl = 'http://localhost:8081/api';

  readonly keycloak = new Keycloak({
    url: 'http://localhost:8180',
    realm: 'rexel-realm',
    clientId: 'rexel-app'
  });

  private currentUserSubject = new BehaviorSubject<StoreUser | null>(null);
  readonly currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {}

  async init(): Promise<void> {
    const authenticated = await this.keycloak.init({ onLoad: 'check-sso' });
    if (authenticated) {
      await this.loadProfile();
    }
  }

  private async loadProfile(): Promise<void> {
    const profile = await firstValueFrom(this.http.get<StoreUser>(`${this.apiUrl}/users/me`));
    this.currentUserSubject.next(profile);
  }

  get currentUser(): StoreUser | null {
    return this.currentUserSubject.value;
  }

  isLoggedIn(): boolean {
    return !!this.keycloak.authenticated;
  }

  isAdmin(): boolean {
    return this.currentUserSubject.value?.role === 'ADMIN';
  }

  requestLogin(): void {
    this.keycloak.login({ redirectUri: window.location.href });
  }

  loginWithPassword(email: string, password: string): Observable<void> {
    const body = new HttpParams()
      .set('grant_type', 'password')
      .set('client_id', 'rexel-app')
      .set('username', email)
      .set('password', password);

    return this.http.post<KeycloakTokenResponse>(
      `${this.keycloak.authServerUrl}/realms/${this.keycloak.realm}/protocol/openid-connect/token`,
      body,
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    ).pipe(
      switchMap(tokens => {
        this.keycloak.token = tokens.access_token;
        this.keycloak.refreshToken = tokens.refresh_token;
        this.keycloak.tokenParsed = this.decodeJwtPayload(tokens.access_token);
        this.keycloak.timeSkew = 0;
        this.keycloak.authenticated = true;
        return from(this.loadProfile());
      })
    );
  }

  private decodeJwtPayload(token: string): Record<string, unknown> {
    const payload = token.split('.')[1];
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
        .join('')
    );
    return JSON.parse(json);
  }

  register(): void {
    this.keycloak.register({ redirectUri: window.location.href });
  }

  updateProfile(request: UpdateProfileRequest): Observable<StoreUser> {
    return this.http.put<StoreUser>(`${this.apiUrl}/users/me`, request).pipe(
      tap(user => this.currentUserSubject.next(user))
    );
  }

  logout(): void {
    this.currentUserSubject.next(null);
    this.keycloak.logout({ redirectUri: window.location.origin });
  }
}
