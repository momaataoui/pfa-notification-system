import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject, tap } from 'rxjs';
import { LoginRequest, RegisterRequest, StoreUser, UpdateProfileRequest } from '../models/store-user.model';

const STORAGE_KEY = 'rexel-mini-store-user';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private readonly apiUrl = 'http://localhost:8081/api';

  private currentUserSubject = new BehaviorSubject<StoreUser | null>(this.readStoredUser());
  readonly currentUser$ = this.currentUserSubject.asObservable();

  private loginModalRequestedSubject = new Subject<void>();
  readonly loginModalRequested$ = this.loginModalRequestedSubject.asObservable();

  constructor(private http: HttpClient) {}

  private readStoredUser(): StoreUser | null {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  }

  private persist(user: StoreUser): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  get currentUser(): StoreUser | null {
    return this.currentUserSubject.value;
  }

  isLoggedIn(): boolean {
    return this.currentUserSubject.value !== null;
  }

  isAdmin(): boolean {
    return this.currentUserSubject.value?.role === 'ADMIN';
  }

  requestLogin(): void {
    this.loginModalRequestedSubject.next();
  }

  login(request: LoginRequest): Observable<StoreUser> {
    return this.http.post<StoreUser>(`${this.apiUrl}/auth/login`, request).pipe(
      tap(user => this.persist(user))
    );
  }

  register(request: RegisterRequest): Observable<StoreUser> {
    return this.http.post<StoreUser>(`${this.apiUrl}/auth/register`, request);
  }

  updateProfile(id: number, request: UpdateProfileRequest): Observable<StoreUser> {
    return this.http.put<StoreUser>(`${this.apiUrl}/users/${id}`, request).pipe(
      tap(user => this.persist(user))
    );
  }

  logout(): void {
    localStorage.removeItem(STORAGE_KEY);
    this.currentUserSubject.next(null);
  }
}
