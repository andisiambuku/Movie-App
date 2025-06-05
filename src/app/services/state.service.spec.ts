// state.service.spec.ts
import { TestBed } from '@angular/core/testing';
import { StateService, AppState } from './state.service';
import { Movie, MovieDetails } from './movie.service';

describe('StateService', () => {
  let service: StateService;
  let mockLocalStorage: jasmine.SpyObj<Storage>;

  const mockMovies: Movie[] = [
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
  ];

  const mockMovieDetails: MovieDetails = {
    ...mockMovies[0],
    genres: [{ id: 1, name: 'Action' }],
    runtime: 120,
    budget: 1000000,
    revenue: 5000000,
    production_companies: [],
    cast: [],
    crew: []
  };

  beforeEach(() => {
    mockLocalStorage = jasmine.createSpyObj('localStorage', ['getItem', 'setItem']);
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage
    });

    TestBed.configureTestingModule({
      providers: [StateService]
    });
    service = TestBed.inject(StateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize with saved favorites from localStorage', () => {
    const savedFavorites = [1, 2, 3];
    mockLocalStorage.getItem.and.returnValue(JSON.stringify(savedFavorites));
    
    // Create new service instance to test initialization
    const newService = new StateService();
    
    expect(mockLocalStorage.getItem).toHaveBeenCalledWith('favoriteMovies');
    expect(newService.currentState.favoriteMovies).toEqual(savedFavorites);
  });

  it('should set movies', () => {
    service.setMovies(mockMovies, 1, 10);
    
    expect(service.currentState.movies).toEqual(mockMovies);
    expect(service.currentState.currentPage).toBe(1);
    expect(service.currentState.totalPages).toBe(10);
  });

  it('should set selected movie', () => {
    service.setSelectedMovie(mockMovieDetails);
    
    expect(service.currentState.selectedMovie).toEqual(mockMovieDetails);
  });

  it('should set search query', () => {
    const query = 'test query';
    service.setSearchQuery(query);
    
    expect(service.currentState.searchQuery).toBe(query);
  });

  it('should emit state changes', (done) => {
    let emissionCount = 0;
    
    service.state$.subscribe(state => {
      emissionCount++;
      if (emissionCount === 2) {
        expect(state.searchQuery).toBe('test');
        done();
      }
    });
    
    service.setSearchQuery('test');
  });

  it('should get current state', () => {
    const currentState = service.currentState;
    expect(currentState).toBeDefined();
    expect(currentState.movies).toEqual([]);
    expect(currentState.selectedMovie).toBeNull();
  });
});
