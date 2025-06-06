import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService, User } from '../../services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NameFormatterPipe } from "../../shared/pipe/name-formatter.pipe";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  imports: [CommonModule, RouterModule, NameFormatterPipe],
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
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