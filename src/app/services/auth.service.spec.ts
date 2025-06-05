import { TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { AuthService, User } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let mockLocalStorage: jasmine.SpyObj<Storage>;

  beforeEach(() => {
    mockLocalStorage = jasmine.createSpyObj('localStorage', ['getItem', 'setItem', 'removeItem']);
    
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: PLATFORM_ID, useValue: 'browser' }
      ]
    });
    
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage
    });
    
    service = TestBed.inject(AuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize with saved user from localStorage', () => {
    const savedUser: User = {
      id: '1',
      email: 'test@example.com',
      name: 'Test User'
    };
    
    mockLocalStorage.getItem.and.returnValue(JSON.stringify(savedUser));
    
    // Create new service instance to test initialization
    service = new AuthService('browser');
    
    expect(mockLocalStorage.getItem).toHaveBeenCalledWith('currentUser');
    expect(service.currentUser).toEqual(savedUser);
    expect(service.isAuthenticated).toBe(true);
  });

  it('should login successfully with valid credentials', (done) => {
    const email = 'test@example.com';
    const password = 'password';

    service.login(email, password).subscribe(result => {
      expect(result).toBe(true);
      expect(service.isAuthenticated).toBe(true);
      expect(service.currentUser?.email).toBe(email);
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'currentUser',
        jasmine.any(String)
      );
      done();
    });
  });

  it('should fail login with invalid credentials', (done) => {
    service.login('', '').subscribe(result => {
      expect(result).toBe(false);
      expect(service.isAuthenticated).toBe(false);
      done();
    });
  });

  it('should logout successfully', () => {
    // First login
    service.login('test@example.com', 'password').subscribe();
    
    // Then logout
    service.logout();
    
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('currentUser');
    expect(service.currentUser).toBeNull();
    expect(service.isAuthenticated).toBe(false);
  });

  it('should handle server-side rendering', () => {
    const ssrService = new AuthService('server');
    
    expect(ssrService.currentUser).toBeNull();
    expect(ssrService.isAuthenticated).toBe(false);
  });
});
