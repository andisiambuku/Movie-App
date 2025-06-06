import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { MovieDetailsComponent } from './movie-details.component';
import { MovieService, MovieDetails } from '../../../services/movie.service';
import { StateService } from '../../../services/state.service';

describe('MovieDetailsComponent', () => {
  let component: MovieDetailsComponent;
  let fixture: ComponentFixture<MovieDetailsComponent>;
  let movieService: jasmine.SpyObj<MovieService>;
  let stateService: jasmine.SpyObj<StateService>;
  let router: jasmine.SpyObj<Router>;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let activatedRoute: jasmine.SpyObj<ActivatedRoute>;

  const mockMovieDetails: MovieDetails = {
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

  beforeEach(async () => {
    const movieServiceSpy = jasmine.createSpyObj('MovieService', ['getMovieDetails', 'getImageUrl', 'loading$']);
    const stateServiceSpy = jasmine.createSpyObj('StateService', [
      'setSelectedMovie', 'isFavorite', 'addToFavorites', 'removeFromFavorites'
    ], {
      state$: of({ selectedMovie: mockMovieDetails })
    });
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const activatedRouteSpy = jasmine.createSpyObj('ActivatedRoute', [], {
      params: of({ id: '1' })
    });

    await TestBed.configureTestingModule({
      imports: [MovieDetailsComponent],
      providers: [
        { provide: MovieService, useValue: movieServiceSpy },
        { provide: StateService, useValue: stateServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: activatedRouteSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MovieDetailsComponent);
    component = fixture.componentInstance;
    movieService = TestBed.inject(MovieService) as jasmine.SpyObj<MovieService>;
    stateService = TestBed.inject(StateService) as jasmine.SpyObj<StateService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    activatedRoute = TestBed.inject(ActivatedRoute) as jasmine.SpyObj<ActivatedRoute>;

    movieService.loading$ = of(false);
    movieService.getMovieDetails.and.returnValue(of(mockMovieDetails));
    stateService.isFavorite.and.returnValue(of(false));
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load movie details on init', () => {
    component.ngOnInit();

    expect(movieService.getMovieDetails).toHaveBeenCalledWith(1);
    expect(stateService.setSelectedMovie).toHaveBeenCalledWith(mockMovieDetails);
  });

  it('should navigate to home on error', () => {
    spyOn(console, 'error');
    movieService.getMovieDetails.and.returnValue(throwError(() => 'API Error'));

    component.ngOnInit();

    expect(console.error).toHaveBeenCalledWith('Error loading movie details:', 'API Error');
    expect(router.navigate).toHaveBeenCalledWith(['/']);
  });

  it('should go back', () => {
    component.goBack();
    expect(router.navigate).toHaveBeenCalledWith(['/']);
  });

  it('should toggle favorite when not favorite', () => {
    stateService.isFavorite.and.returnValue(of(false));

    component.toggleFavorite(1);

    expect(stateService.addToFavorites).toHaveBeenCalledWith(1);
  });

  it('should toggle favorite when is favorite', () => {
    stateService.isFavorite.and.returnValue(of(true));

    component.toggleFavorite(1);

    expect(stateService.removeFromFavorites).toHaveBeenCalledWith(1);
  });

  it('should get image URL', () => {
    movieService.getImageUrl.and.returnValue('test-url');

    const url = component.getImageUrl('/test.jpg');

    expect(movieService.getImageUrl).toHaveBeenCalledWith('/test.jpg');
    expect(url).toBe('test-url');
  });

  it('should format currency', () => {
    const formatted = component.formatCurrency(1000000);
    expect(formatted).toBe('$1,000,000.00');
  });

  it('should format runtime', () => {
    const formatted = component.formatRuntime(125);
    expect(formatted).toBe('2h 5m');
  });

  it('should format runtime with no minutes', () => {
    const formatted = component.formatRuntime(120);
    expect(formatted).toBe('2h 0m');
  });
});