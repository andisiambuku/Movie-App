import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { MovieListComponent } from './movie-list.component';
import { MovieService, Movie, MovieResponse } from '../../../services/movie.service';
import { StateService } from '../../../services/state.service';

describe('MovieListComponent', () => {
  let component: MovieListComponent;
  let fixture: ComponentFixture<MovieListComponent>;
  let movieService: jasmine.SpyObj<MovieService>;
  let stateService: jasmine.SpyObj<StateService>;
  let router: jasmine.SpyObj<Router>;

  const mockMovies: Movie[] = [
    {
      id: 1,
      title: 'Test Movie 1',
      overview: 'Test overview 1',
      poster_path: '/test1.jpg',
      backdrop_path: '/backdrop1.jpg',
      release_date: '2023-01-01',
      vote_average: 8.0,
      vote_count: 1000,
      genre_ids: [1, 2]
    }
  ];

  const mockMovieResponse: MovieResponse = {
    page: 1,
    results: mockMovies,
    total_pages: 10,
    total_results: 100
  };

  const mockState = {
    movies: mockMovies,
    selectedMovie: null,
    searchQuery: '',
    currentPage: 1,
    totalPages: 10,
    favoriteMovies: []
  };

  beforeEach(async () => {
    const movieServiceSpy = jasmine.createSpyObj('MovieService', [
      'getPopularMovies', 'searchMovies', 'getImageUrl'
    ], {
      loading$: of(false)
    });
    const stateServiceSpy = jasmine.createSpyObj('StateService', [
      'setMovies', 'setSearchQuery', 'isFavorite', 'addToFavorites', 'removeFromFavorites'
    ], {
      state$: of(mockState),
      currentState: mockState
    });
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [MovieListComponent],
      providers: [
        { provide: MovieService, useValue: movieServiceSpy },
        { provide: StateService, useValue: stateServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MovieListComponent);
    component = fixture.componentInstance;
    movieService = TestBed.inject(MovieService) as jasmine.SpyObj<MovieService>;
    stateService = TestBed.inject(StateService) as jasmine.SpyObj<StateService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    movieService.getPopularMovies.and.returnValue(of(mockMovieResponse));
    movieService.searchMovies.and.returnValue(of(mockMovieResponse));
    stateService.isFavorite.and.returnValue(of(false));
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load movies on init', () => {
    component.ngOnInit();

    expect(movieService.getPopularMovies).toHaveBeenCalled();
    expect(stateService.setMovies).toHaveBeenCalledWith(
      mockMovies,
      1,
      10
    );
  });

    it('should handle search', fakeAsync(() => {
    component.ngOnInit();
    
    // Create a mock input element with proper event structure
    const mockInput = document.createElement('input');
    mockInput.value = 'test query';
    
    const event = {
      target: mockInput
    } as unknown as Event;
    
    component.onSearch(event);
    
    tick(300); // Wait for debounce
    
    expect(stateService.setSearchQuery).toHaveBeenCalledWith('test query');
    expect(movieService.searchMovies).toHaveBeenCalledWith('test query', 1);
  }));

  it('should track movies by ID', () => {
    const movie = mockMovies[0];
    const trackId = component.trackByMovieId(0, movie);
    expect(trackId).toBe(movie.id);
  });

  it('should navigate to movie details on click', () => {
    const movie = mockMovies[0];
    component.onMovieClick(movie);
    expect(router.navigate).toHaveBeenCalledWith(['/movie', movie.id]);
  });

  it('should toggle favorite and stop propagation', () => {
    const event = jasmine.createSpyObj('Event', ['stopPropagation']);
    stateService.isFavorite.and.returnValue(of(false));

    component.toggleFavorite(1, event);

    expect(event.stopPropagation).toHaveBeenCalled();
    expect(stateService.addToFavorites).toHaveBeenCalledWith(1);
  });

  it('should get image URL', () => {
    movieService.getImageUrl.and.returnValue('test-url');

    const url = component.getImageUrl('/test.jpg');

    expect(movieService.getImageUrl).toHaveBeenCalledWith('/test.jpg');
    expect(url).toBe('test-url');
  });
});