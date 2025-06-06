import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { trigger, transition, animate, style, keyframes } from '@angular/animations';
import { MovieService, Movie } from '../../services/movie.service';

@Component({
  selector: 'app-hero-banner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hero-banner.component.html',
  animations: [
    trigger('fadeSlide', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(1.1)' }),
        animate('1000ms ease-out', style({ opacity: 1, transform: 'scale(1)' }))
      ])
    ]),
    trigger('fadeContent', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(30px)' }),
        animate('800ms 200ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('bounceArrow', [
      transition(':enter', [
        animate('2s infinite', keyframes([
          style({ transform: 'translateY(0px)', offset: 0 }),
          style({ transform: 'translateY(-8px)', offset: 0.5 }),
          style({ transform: 'translateY(0px)', offset: 1 })
        ]))
      ])
    ])
  ]
})
export class HeroBannerComponent implements OnInit, OnDestroy {
  heroMovies: Movie[] = [];
  currentIndex = 0;
  isLoading = true;
  private intervalId:  ReturnType<typeof setInterval> | null = null;

  constructor(
    private movieService: MovieService,
    @Inject(PLATFORM_ID) private platformId: object
  ) {}

  ngOnInit() {
    // Only load movies when running in browser
    if (isPlatformBrowser(this.platformId)) {
      this.loadHeroMovies();
    } else {
      // For SSR, set loading to false and provide placeholder data
      this.isLoading = false;
    }
  }

  ngOnDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  loadHeroMovies() {
    this.movieService.getPopularMovies(1).subscribe({
      next: (response) => {
        // Get top 5 movies with good backdrop images
        this.heroMovies = response.results
          .filter(movie => movie.backdrop_path && movie.vote_average > 7)
          .slice(0, 5);
        
        this.isLoading = false;
        if (this.heroMovies.length > 0) {
          this.startAutoSlide();
        }
      },
      error: (error) => {
        console.error('Error loading hero movies:', error);
        this.isLoading = false;
        // Optionally set some fallback movies here
      }
    });
  }

  startAutoSlide() {
    // Only start auto-slide if we have movies and we're in browser
    if (isPlatformBrowser(this.platformId) && this.heroMovies.length > 1) {
      this.intervalId = setInterval(() => {
        this.nextSlide();
      }, 6000);
    }
  }

  nextSlide() {
    if (this.heroMovies.length > 0) {
      this.currentIndex = (this.currentIndex + 1) % this.heroMovies.length;
    }
  }

  previousSlide() {
    if (this.heroMovies.length > 0) {
      this.currentIndex = this.currentIndex === 0 
        ? this.heroMovies.length - 1 
        : this.currentIndex - 1;
    }
  }

  goToSlide(index: number) {
    if (index >= 0 && index < this.heroMovies.length) {
      this.currentIndex = index;
    }
  }

  // New method to handle scroll to next section
  scrollToNextSection() {
    if (isPlatformBrowser(this.platformId)) {
      // Get the height of the viewport
      const viewportHeight = window.innerHeight;
      
      // Smooth scroll to the next section
      window.scrollTo({
        top: viewportHeight,
        behavior: 'smooth'
      });
    }
  }

  getBackdropUrl(backdropPath: string): string {
    return backdropPath 
      ? `https://image.tmdb.org/t/p/w1280${backdropPath}`
      : '/assets/placeholder-backdrop.jpg';
  }

  getYear(dateString: string): string {
    return dateString ? new Date(dateString).getFullYear().toString() : '';
  }

  truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength).trim() + '...';
  }

  playTrailer(movie: Movie) {
    console.log('Play trailer for:', movie.title);
  }

  viewDetails(movie: Movie) {
    console.log('View details for:', movie.title);
  }
}