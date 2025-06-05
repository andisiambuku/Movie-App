import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { takeUntil, switchMap } from 'rxjs/operators';
import { MovieService, MovieDetails } from '../../../services/movie.service';
import { StateService } from '../../../services/state.service';
import { map } from 'rxjs/operators'; 
import { Store } from '@ngrx/store';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-movie-details',
   imports: [CommonModule, RouterModule],
  templateUrl: './movie-details.component.html',
  styleUrls: ['./movie-details.component.css']
})
export class MovieDetailsComponent implements OnInit, OnDestroy {
  movie$: Observable<MovieDetails | null>;
  loading$: Observable<boolean>;


  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private movieService: MovieService,
    private stateService: StateService
  ) {
    this.movie$ = this.stateService.state$.pipe(
      takeUntil(this.destroy$),
      map(state => state.selectedMovie)
    );
    this.loading$ = this.movieService.loading$;
  }

  ngOnInit(): void {
    this.route.params.pipe(
      takeUntil(this.destroy$),
      switchMap(params => {
        const movieId = +params['id'];
        return this.movieService.getMovieDetails(movieId);
      })
    ).subscribe(movie => {
      this.stateService.setSelectedMovie(movie);
    }, error => {
      console.error('Error loading movie details:', error);
      this.router.navigate(['/']);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  goBack(): void {
    this.router.navigate(['/']);
  }

  toggleFavorite(movieId: number): void {
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

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  formatRuntime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  }
}