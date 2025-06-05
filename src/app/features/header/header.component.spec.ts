import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { Router } from '@angular/router';

import { HeaderComponent } from './header.component';
import { AuthService } from '../../services/auth.service';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let router: Router;

  beforeEach(async () => {
    // Create spy object for AuthService
    mockAuthService = jasmine.createSpyObj('AuthService', ['logout'], {
      currentUser$: of(null),
      isAuthenticated$: of(false)
    });

    await TestBed.configureTestingModule({
      imports: [
        HeaderComponent,
        RouterTestingModule // This provides Router and ActivatedRoute
      ],
      providers: [
        { provide: AuthService, useValue: mockAuthService }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    spyOn(router, 'navigate');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize observables', () => {
    expect(component.currentUser$).toBeDefined();
    expect(component.isAuthenticated$).toBeDefined();
  });

  it('should toggle menu', () => {
    expect(component.isMenuOpen).toBeFalse();
    component.toggleMenu();
    expect(component.isMenuOpen).toBeTrue();
    component.toggleMenu();
    expect(component.isMenuOpen).toBeFalse();
  });

  it('should logout and navigate to login', () => {
    component.logout();
    
    expect(mockAuthService.logout).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
    expect(component.isMenuOpen).toBeFalse();
  });

  it('should navigate home and close menu', () => {
    component.isMenuOpen = true;
    component.navigateHome();
    
    expect(router.navigate).toHaveBeenCalledWith(['/']);
    expect(component.isMenuOpen).toBeFalse();
  });
});