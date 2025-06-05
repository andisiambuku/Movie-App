import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable } from 'rxjs';


export interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    // Only access localStorage in the browser
    if (isPlatformBrowser(this.platformId)) {
      // Check if user is already logged in
      const savedUser = localStorage.getItem('currentUser');
      if (savedUser) {
        this.currentUserSubject.next(JSON.parse(savedUser));
        this.isAuthenticatedSubject.next(true);
      }
    }
  }

  login(email: string, password: string): Observable<boolean> {
    // Simulate authentication - replace with real Auth0 implementation
    return new Observable(observer => {
      setTimeout(() => {
        if (email && password) {
          const user: User = {
            id: '1',
            email: email,
            name: email.split('@')[0],
            picture: 'https://via.placeholder.com/150'
          };
          
          // Only use localStorage in the browser
          if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem('currentUser', JSON.stringify(user));
          }
          
          this.currentUserSubject.next(user);
          this.isAuthenticatedSubject.next(true);
          observer.next(true);
        } else {
          observer.next(false);
        }
        observer.complete();
      }, 1000);
    });
  }

  logout(): void {
    // Only use localStorage in the browser
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('currentUser');
    }
    
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
  }

  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  get isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }
}