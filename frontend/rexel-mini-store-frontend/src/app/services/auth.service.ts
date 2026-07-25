import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import Keycloak from 'keycloak-js';
import { BehaviorSubject, Observable, firstValueFrom, tap } from 'rxjs';
import { StoreUser, UpdateProfileRequest } from '../models/store-user.model';

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
