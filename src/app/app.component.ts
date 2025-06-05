import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd, RouterOutlet } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { HeaderComponent } from './features/header/header.component';
import { HeroBannerComponent } from "./features/hero-banner/hero-banner.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, HeroBannerComponent], 
  template: `
    <div class="app-container">
      <app-header></app-header>
      <main>
        @if (showHeroBanner) {
          <app-hero-banner></app-hero-banner>
        }
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'Filamu';
  showHeroBanner = true;
  private routerSubscription?: Subscription;

  constructor(private router: Router) {}

  ngOnInit() {
    // Listen to route changes
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.updateHeroBannerVisibility(event.url);
      });

    // Set initial state
    this.updateHeroBannerVisibility(this.router.url);
  }

  ngOnDestroy() {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  private updateHeroBannerVisibility(url: string) {
    // Hide hero banner on movie details page
    const hiddenRoutes = ['/movie/'];
    this.showHeroBanner = !hiddenRoutes.some(route => url.includes(route));
  }
}