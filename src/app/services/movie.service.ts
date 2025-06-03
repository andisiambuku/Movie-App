import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  release_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
}

export interface MovieDetails extends Movie {
  genres: Genre[];
  runtime: number;
  budget: number;
  revenue: number;
  production_companies: ProductionCompany[];
  cast: CastMember[];
  crew: CrewMember[];
}

export interface Genre {
  id: number;
  name: string;
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string;
}

export interface CrewMember {
  id: number;
  name: string;
  job: string;
  profile_path: string;
}

export interface ProductionCompany {
  id: number;
  name: string;
  logo_path: string;
}

export interface MovieResponse {
  page: number;
  results: Movie[];
  total_pages: number;
  total_results: number;
}

@Injectable({
  providedIn: 'root'
})
export class MovieService {
  private readonly apiKey = environment.tmdbApiKey;
  private readonly baseUrl = environment.tmdbBaseUrl;
  private readonly imageBaseUrl = 'https://image.tmdb.org/t/p/w500';

  private cache = new Map<string, any>();
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  constructor(private http: HttpClient) {}

  getPopularMovies(page: number = 1): Observable<MovieResponse> {
    const cacheKey = `popular_${page}`;
    
    if (this.cache.has(cacheKey)) {
      return of(this.cache.get(cacheKey));
    }

    this.loadingSubject.next(true);
    
    const params = new HttpParams()
      .set('api_key', this.apiKey)
      .set('page', page.toString());

    return this.http.get<MovieResponse>(`${this.baseUrl}/movie/popular`, { params })
      .pipe(
        tap(response => {
          this.cache.set(cacheKey, response);
          this.loadingSubject.next(false);
        }),
        catchError(error => {
          this.loadingSubject.next(false);
          throw error;
        })
      );
  }

  searchMovies(query: string, page: number = 1): Observable<MovieResponse> {
    if (!query.trim()) {
      return this.getPopularMovies(page);
    }

    const cacheKey = `search_${query}_${page}`;
    
    if (this.cache.has(cacheKey)) {
      return of(this.cache.get(cacheKey));
    }

    this.loadingSubject.next(true);

    const params = new HttpParams()
      .set('api_key', this.apiKey)
      .set('query', query)
      .set('page', page.toString());

    return this.http.get<MovieResponse>(`${this.baseUrl}/search/movie`, { params })
      .pipe(
        tap(response => {
          this.cache.set(cacheKey, response);
          this.loadingSubject.next(false);
        }),
        catchError(error => {
          this.loadingSubject.next(false);
          throw error;
        })
      );
  }

  getMovieDetails(id: number): Observable<MovieDetails> {
    const cacheKey = `details_${id}`;
    
    if (this.cache.has(cacheKey)) {
      return of(this.cache.get(cacheKey));
    }

    this.loadingSubject.next(true);

    const params = new HttpParams()
      .set('api_key', this.apiKey)
      .set('append_to_response', 'credits');

    return this.http.get<any>(`${this.baseUrl}/movie/${id}`, { params })
      .pipe(
        map(response => ({
          ...response,
          cast: response.credits?.cast?.slice(0, 10) || [],
          crew: response.credits?.crew?.slice(0, 5) || []
        })),
        tap(response => {
          this.cache.set(cacheKey, response);
          this.loadingSubject.next(false);
        }),
        catchError(error => {
          this.loadingSubject.next(false);
          throw error;
        })
      );
  }

  getImageUrl(path: string): string {
    return path ? `${this.imageBaseUrl}${path}` : '/assets/placeholder-movie.jpg';
  }

  clearCache(): void {
    this.cache.clear();
  }
}