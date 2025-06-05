import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Movie, MovieDetails } from './movie.service';

export interface AppState {
  movies: Movie[];
  selectedMovie: MovieDetails | null;
  searchQuery: string;
  currentPage: number;
  totalPages: number;
  favoriteMovies: number[];
}

const initialState: AppState = {
  movies: [],
  selectedMovie: null,
  searchQuery: '',
  currentPage: 1,
  totalPages: 1,
  favoriteMovies: []
};

@Injectable({
  providedIn: 'root'
})
export class StateService {
  private stateSubject = new BehaviorSubject<AppState>(initialState);
  public state$ = this.stateSubject.asObservable();

  constructor() {
    // Load favorites from localStorage
    const savedFavorites = localStorage.getItem('favoriteMovies');
    if (savedFavorites) {
      this.updateState({
        favoriteMovies: JSON.parse(savedFavorites)
      });
    }
  }

  private updateState(partialState: Partial<AppState>): void {
    const currentState = this.stateSubject.value;
    const newState = { ...currentState, ...partialState };
    this.stateSubject.next(newState);
  }

  setMovies(movies: Movie[], currentPage: number, totalPages: number): void {
    this.updateState({
      movies,
      currentPage,
      totalPages
    });
  }

  setSelectedMovie(movie: MovieDetails | null): void {
    this.updateState({ selectedMovie: movie });
  }

  setSearchQuery(query: string): void {
    this.updateState({ searchQuery: query });
  }

  addToFavorites(movieId: number): void {
    const currentState = this.stateSubject.value;
    const favorites = [...currentState.favoriteMovies, movieId];
    localStorage.setItem('favoriteMovies', JSON.stringify(favorites));
    this.updateState({ favoriteMovies: favorites });
  }

  removeFromFavorites(movieId: number): void {
    const currentState = this.stateSubject.value;
    const favorites = currentState.favoriteMovies.filter(id => id !== movieId);
    localStorage.setItem('favoriteMovies', JSON.stringify(favorites));
    this.updateState({ favoriteMovies: favorites });
  }

  isFavorite(movieId: number): Observable<boolean> {
    return new Observable(observer => {
      this.state$.subscribe(state => {
        observer.next(state.favoriteMovies.includes(movieId));
      });
    });
  }

  get currentState(): AppState {
    return this.stateSubject.value;
  }
}