import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService, User } from '../../services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
   imports: [CommonModule, RouterModule],
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  currentUser$: Observable<User | null>;
  isAuthenticated$: Observable<boolean>;
  isMenuOpen = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.currentUser$ = this.authService.currentUser$;
    this.isAuthenticated$ = this.authService.isAuthenticated$;
  }

  ngOnInit(): void {}

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
    this.isMenuOpen = false;
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  navigateHome(): void {
    this.router.navigate(['/']);
    this.isMenuOpen = false;
  }
}