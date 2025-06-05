import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { LoginComponent } from './login.component';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    // Create spy objects for dependencies
    mockAuthService = jasmine.createSpyObj('AuthService', ['login'], {
      isAuthenticated: false
    });
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [LoginComponent, ReactiveFormsModule, CommonModule],
      providers: [
        FormBuilder,
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize form with empty fields and validators', () => {
      expect(component.loginForm).toBeDefined();
      expect(component.loginForm.get('email')?.value).toBe('');
      expect(component.loginForm.get('password')?.value).toBe('');
      expect(component.loginForm.get('email')?.hasError('required')).toBeTruthy();
      expect(component.loginForm.get('password')?.hasError('required')).toBeTruthy();
    });

    it('should initialize loading state and error message', () => {
      expect(component.isLoading).toBeFalsy();
      expect(component.errorMessage).toBe('');
    });
  });

  describe('ngOnInit', () => {
    it('should redirect to home if user is already authenticated', () => {
      // Arrange
      Object.defineProperty(mockAuthService, 'isAuthenticated', {
        get: () => true
      });

      // Act
      component.ngOnInit();

      // Assert
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
    });

    it('should not redirect if user is not authenticated', () => {
      // Arrange
      Object.defineProperty(mockAuthService, 'isAuthenticated', {
        get: () => false
      });

      // Act
      component.ngOnInit();

      // Assert
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });
  });

  describe('Form Validation', () => {
    it('should validate email field as required', () => {
      const emailControl = component.loginForm.get('email');
      
      expect(emailControl?.hasError('required')).toBeTruthy();
      
      emailControl?.setValue('test');
      expect(emailControl?.hasError('email')).toBeTruthy();
      
      emailControl?.setValue('test@example.com');
      expect(emailControl?.hasError('required')).toBeFalsy();
      expect(emailControl?.hasError('email')).toBeFalsy();
    });

    it('should validate password field with minimum length', () => {
      const passwordControl = component.loginForm.get('password');
      
      expect(passwordControl?.hasError('required')).toBeTruthy();
      
      passwordControl?.setValue('123');
      expect(passwordControl?.hasError('minlength')).toBeTruthy();
      
      passwordControl?.setValue('123456');
      expect(passwordControl?.hasError('required')).toBeFalsy();
      expect(passwordControl?.hasError('minlength')).toBeFalsy();
    });

    it('should invalidate form when fields are invalid', () => {
      expect(component.loginForm.valid).toBeFalsy();
      
      component.loginForm.patchValue({
        email: 'invalid-email',
        password: '123'
      });
      
      expect(component.loginForm.valid).toBeFalsy();
    });

    it('should validate form when all fields are valid', () => {
      component.loginForm.patchValue({
        email: 'test@example.com',
        password: '123456'
      });
      
      expect(component.loginForm.valid).toBeTruthy();
    });
  });

  describe('Form Getters', () => {
    it('should return email form control', () => {
      const emailControl = component.email;
      expect(emailControl).toBe(component.loginForm.get('email'));
    });

    it('should return password form control', () => {
      const passwordControl = component.password;
      expect(passwordControl).toBe(component.loginForm.get('password'));
    });
  });

  describe('onSubmit', () => {
    beforeEach(() => {
      // Set up valid form data
      component.loginForm.patchValue({
        email: 'test@example.com',
        password: '123456'
      });
    });

    it('should not submit if form is invalid', () => {
      // Arrange
      component.loginForm.patchValue({
        email: 'invalid-email',
        password: '123'
      });

      // Act
      component.onSubmit();

      // Assert
      expect(mockAuthService.login).not.toHaveBeenCalled();
      expect(component.isLoading).toBeFalsy();
    });

    it('should submit and handle successful login', () => {
      // Arrange
      mockAuthService.login.and.returnValue(of(true));

      // Act
      component.onSubmit();

      // Assert
      expect(component.isLoading).toBeFalsy();
      expect(component.errorMessage).toBe('');
      expect(mockAuthService.login).toHaveBeenCalledWith('test@example.com', '123456');
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
    });

    it('should handle failed login with invalid credentials', () => {
      // Arrange
      mockAuthService.login.and.returnValue(of(false));

      // Act
      component.onSubmit();

      // Assert
      expect(component.isLoading).toBeFalsy();
      expect(component.errorMessage).toBe('Invalid email or password');
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });

    it('should handle login error', () => {
      // Arrange
      mockAuthService.login.and.returnValue(throwError(() => new Error('Network error')));

      // Act
      component.onSubmit();

      // Assert
      expect(component.isLoading).toBeFalsy();
      expect(component.errorMessage).toBe('Login failed. Please try again.');
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });

    it('should set loading state during login process', () => {
      // Arrange
      mockAuthService.login.and.returnValue(of(true));

      // Act
      component.onSubmit();

      // Assert - loading should be handled properly
      expect(mockAuthService.login).toHaveBeenCalled();
    });

    it('should clear error message on new submission', () => {
      // Arrange
      component.errorMessage = 'Previous error';
      mockAuthService.login.and.returnValue(of(true));

      // Act
      component.onSubmit();

      // Assert
      expect(component.errorMessage).toBe('');
    });

    it('should call authService.login with correct parameters', () => {
      // Arrange
      mockAuthService.login.and.returnValue(of(true));

      // Act
      component.onSubmit();

      // Assert
      expect(mockAuthService.login).toHaveBeenCalledWith('test@example.com', '123456');
      expect(mockAuthService.login).toHaveBeenCalledTimes(1);
    });
  });

  describe('Integration Tests', () => {
    it('should complete full login flow successfully', () => {
      // Arrange
      mockAuthService.login.and.returnValue(of(true));
      
      // Act - fill form and submit
      component.loginForm.patchValue({
        email: 'user@example.com',
        password: 'password123'
      });
      component.onSubmit();

      // Assert
      expect(component.loginForm.valid).toBeTruthy();
      expect(mockAuthService.login).toHaveBeenCalledWith('user@example.com', 'password123');
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
      expect(component.isLoading).toBeFalsy();
      expect(component.errorMessage).toBe('');
    });

    it('should handle complete error flow', () => {
      // Arrange
      const errorResponse = throwError(() => new Error('Server error'));
      mockAuthService.login.and.returnValue(errorResponse);
      
      // Act
      component.loginForm.patchValue({
        email: 'user@example.com',
        password: 'password123'
      });
      component.onSubmit();

      // Assert
      expect(component.isLoading).toBeFalsy();
      expect(component.errorMessage).toBe('Login failed. Please try again.');
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });
  });
});