import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { MovieService, MovieResponse, MovieDetails } from './movie.service';
import { environment } from '../../environments/environment';

describe('MovieService', () => {
  let service: MovieService;
  let httpMock: HttpTestingController;

  const mockMovieResponse: MovieResponse = {
    page: 1,
    results: [
      {
        id: 1,
        title: 'Test Movie',
        overview: 'Test overview',
        poster_path: '/test.jpg',
        backdrop_path: '/backdrop.jpg',
        release_date: '2023-01-01',
        vote_average: 8.0,
        vote_count: 1000,
        genre_ids: [1, 2]
      }
    ],
    total_pages: 10,
    total_results: 100
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [MovieService]
    });
    service = TestBed.inject(MovieService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get popular movies', () => {
    service.getPopularMovies().subscribe(response => {
      expect(response).toEqual(mockMovieResponse);
    });

    const req = httpMock.expectOne(
      `${environment.tmdbBaseUrl}/movie/popular?api_key=${environment.tmdbApiKey}&page=1`
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockMovieResponse);
  });

  it('should cache popular movies', () => {
    // First call
    service.getPopularMovies().subscribe();
    const req1 = httpMock.expectOne(
      `${environment.tmdbBaseUrl}/movie/popular?api_key=${environment.tmdbApiKey}&page=1`
    );
    req1.flush(mockMovieResponse);

    // Second call should return cached result
    service.getPopularMovies().subscribe(response => {
      expect(response).toEqual(mockMovieResponse);
    });

    httpMock.expectNone(
      `${environment.tmdbBaseUrl}/movie/popular?api_key=${environment.tmdbApiKey}&page=1`
    );
  });

  it('should search movies', () => {
    const query = 'test';
    
    service.searchMovies(query).subscribe(response => {
      expect(response).toEqual(mockMovieResponse);
    });

    const req = httpMock.expectOne(
      `${environment.tmdbBaseUrl}/search/movie?api_key=${environment.tmdbApiKey}&query=${query}&page=1`
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockMovieResponse);
  });

  it('should return popular movies for empty search query', () => {
    service.searchMovies('').subscribe(response => {
      expect(response).toEqual(mockMovieResponse);
    });

    const req = httpMock.expectOne(
      `${environment.tmdbBaseUrl}/movie/popular?api_key=${environment.tmdbApiKey}&page=1`
    );
    req.flush(mockMovieResponse);
  });

  it('should get movie details', () => {
    const mockDetails: MovieDetails = {
      id: 1,
      title: 'Test Movie',
      overview: 'Test overview',
      poster_path: '/test.jpg',
      backdrop_path: '/backdrop.jpg',
      release_date: '2023-01-01',
      vote_average: 8.0,
      vote_count: 1000,
      genre_ids: [1, 2],
      genres: [{ id: 1, name: 'Action' }],
      runtime: 120,
      budget: 1000000,
      revenue: 5000000,
      production_companies: [],
      cast: [],
      crew: []
    };

    service.getMovieDetails(1).subscribe(details => {
      expect(details).toEqual(jasmine.objectContaining({
        id: 1,
        title: 'Test Movie'
      }));
    });

    const req = httpMock.expectOne(
      `${environment.tmdbBaseUrl}/movie/1?api_key=${environment.tmdbApiKey}&append_to_response=credits`
    );
    req.flush({ ...mockDetails, credits: { cast: [], crew: [] } });
  });

  it('should get image URL', () => {
    const url = service.getImageUrl('/test.jpg');
    expect(url).toBe('https://image.tmdb.org/t/p/w500/test.jpg');
  });

  it('should return placeholder for empty image path', () => {
    const url = service.getImageUrl('');
    expect(url).toBe('/assets/placeholder-movie.jpg');
  });

  it('should clear cache', () => {
    // Add something to cache first
    service.getPopularMovies().subscribe();
    const req = httpMock.expectOne(
      `${environment.tmdbBaseUrl}/movie/popular?api_key=${environment.tmdbApiKey}&page=1`
    );
    req.flush(mockMovieResponse);

    service.clearCache();

    // Next call should make HTTP request again
    service.getPopularMovies().subscribe();
    const req2 = httpMock.expectOne(
      `${environment.tmdbBaseUrl}/movie/popular?api_key=${environment.tmdbApiKey}&page=1`
    );
    req2.flush(mockMovieResponse);
  });
});
