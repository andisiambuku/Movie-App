import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subject, combineLatest } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged, switchMap, map } from 'rxjs/operators';
import { MovieService, Movie, MovieResponse } from '../../../services/movie.service';
import { StateService } from '../../../services/state.service'
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-movie-list',
  templateUrl: './movie-list.component.html',
  imports: [CommonModule, FormsModule, HttpClientModule],
  styleUrls: ['./movie-list.component.css']
})
export class MovieListComponent implements OnInit, OnDestroy {
  movies$: Observable<Movie[]>;
  loading$: Observable<boolean>;
  searchQuery = '';
  currentPage = 1;
  totalPages = 1;

  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  constructor(
    private movieService: MovieService,
    private stateService: StateService,
    private router: Router
  ) {
    this.movies$ = this.stateService.state$.pipe(
      takeUntil(this.destroy$),
      map(state => state.movies)
    );
    this.loading$ = this.movieService.loading$;
  }

  ngOnInit(): void {
    // Load initial movies
    this.loadMovies();

    // Setup search functionality
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$),
      switchMap(query => {
        this.stateService.setSearchQuery(query);
        return this.movieService.searchMovies(query, 1);
      })
    ).subscribe(response => {
      this.handleMovieResponse(response);
    });

    // Subscribe to state changes
    this.stateService.state$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(state => {
      this.searchQuery = state.searchQuery;
      this.currentPage = state.currentPage;
      this.totalPages = state.totalPages;
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Fix 1: Type-safe event handling
  onSearch(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target) {
      this.searchSubject.next(target.value);
    }
  }

  // Fix 2: Add the missing trackBy function
  trackByMovieId(index: number, movie: Movie): number {
    return movie.id;
  }

  onMovieClick(movie: Movie): void {
    this.router.navigate(['/movie', movie.id]);
  }

  onPageChange(page: number): void {
    const query = this.stateService.currentState.searchQuery;
    const request$ = query 
      ? this.movieService.searchMovies(query, page)
      : this.movieService.getPopularMovies(page);

    request$.subscribe(response => {
      this.handleMovieResponse(response);
    });
  }

  toggleFavorite(movieId: number, event: Event): void {
    event.stopPropagation();
    
    this.stateService.isFavorite(movieId).pipe(
      takeUntil(this.destroy$)
    ).subscribe(isFavorite => {
      if (isFavorite) {
        this.stateService.removeFromFavorites(movieId);
      } else {
        this.stateService.addToFavorites(movieId);
      }
    });
  }

  getImageUrl(path: string): string {
    return this.movieService.getImageUrl(path);
  }

  private loadMovies(): void {
    this.movieService.getPopularMovies().subscribe(response => {
      this.handleMovieResponse(response);
    });
  }

  private handleMovieResponse(response: MovieResponse): void {
    this.stateService.setMovies(
      response.results,
      response.page,
      response.total_pages
    );
  }
}