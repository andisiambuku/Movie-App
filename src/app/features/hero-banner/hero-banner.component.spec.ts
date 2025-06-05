import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';
import { HeroBannerComponent } from './hero-banner.component';
import { MovieService, Movie } from '../../services/movie.service';

describe('HeroBannerComponent', () => {
  let component: HeroBannerComponent;
  let fixture: ComponentFixture<HeroBannerComponent>;
  let movieService: jasmine.SpyObj<MovieService>;

  const mockMovies: Movie[] = [
    {
      id: 1,
      title: 'Test Movie 1',
      overview: 'Test overview 1',
      backdrop_path: '/test1.jpg',
      poster_path: '/poster1.jpg',
      release_date: '2023-01-01',
      vote_average: 8.0,
      vote_count: 1000,
      genre_ids: [1, 2]
    },
    {
      id: 2,
      title: 'Test Movie 2',
      overview: 'Test overview 2',
      backdrop_path: '/test2.jpg',
      poster_path: '/poster2.jpg',
      release_date: '2023-02-01',
      vote_average: 7.5,
      vote_count: 800,
      genre_ids: [2, 3]
    }
  ];

  beforeEach(async () => {
    const movieServiceSpy = jasmine.createSpyObj('MovieService', ['getPopularMovies']);

    await TestBed.configureTestingModule({
      imports: [HeroBannerComponent, NoopAnimationsModule],
      providers: [
        { provide: MovieService, useValue: movieServiceSpy },
        { provide: PLATFORM_ID, useValue: 'browser' }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HeroBannerComponent);
    component = fixture.componentInstance;
    movieService = TestBed.inject(MovieService) as jasmine.SpyObj<MovieService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load hero movies on init in browser', fakeAsync(() => {
    movieService.getPopularMovies.and.returnValue(of({
      results: mockMovies,
      page: 1,
      total_pages: 10,
      total_results: 100
    }));

    component.ngOnInit();
    tick();

    expect(movieService.getPopularMovies).toHaveBeenCalledWith(1);
    expect(component.heroMovies).toEqual(mockMovies);
    expect(component.isLoading).toBeFalse();
  }));

  it('should handle error when loading movies', fakeAsync(() => {
    spyOn(console, 'error');
    movieService.getPopularMovies.and.returnValue(throwError('API Error'));

    component.ngOnInit();
    tick();

    expect(console.error).toHaveBeenCalledWith('Error loading hero movies:', 'API Error');
    expect(component.isLoading).toBeFalse();
  }));

  it('should start auto-slide when movies are loaded', fakeAsync(() => {
    movieService.getPopularMovies.and.returnValue(of({
      results: mockMovies,
      page: 1,
      total_pages: 10,
      total_results: 100
    }));
    spyOn(component, 'startAutoSlide');

    component.ngOnInit();
    tick();

    expect(component.startAutoSlide).toHaveBeenCalled();
  }));

  it('should navigate to next slide', () => {
    component.heroMovies = mockMovies;
    component.currentIndex = 0;

    component.nextSlide();

    expect(component.currentIndex).toBe(1);
  });

  it('should wrap to first slide when at end', () => {
    component.heroMovies = mockMovies;
    component.currentIndex = 1;

    component.nextSlide();

    expect(component.currentIndex).toBe(0);
  });

  it('should navigate to previous slide', () => {
    component.heroMovies = mockMovies;
    component.currentIndex = 1;

    component.previousSlide();

    expect(component.currentIndex).toBe(0);
  });

  it('should wrap to last slide when at beginning', () => {
    component.heroMovies = mockMovies;
    component.currentIndex = 0;

    component.previousSlide();

    expect(component.currentIndex).toBe(1);
  });

  it('should go to specific slide', () => {
    component.heroMovies = mockMovies;

    component.goToSlide(1);

    expect(component.currentIndex).toBe(1);
  });

  it('should not change index for invalid slide number', () => {
    component.heroMovies = mockMovies;
    component.currentIndex = 0;

    component.goToSlide(5);

    expect(component.currentIndex).toBe(0);
  });

  it('should get backdrop URL', () => {
    const url = component.getBackdropUrl('/test.jpg');
    expect(url).toBe('https://image.tmdb.org/t/p/w1280/test.jpg');
  });

  it('should return placeholder for empty backdrop path', () => {
    const url = component.getBackdropUrl('');
    expect(url).toBe('/assets/placeholder-backdrop.jpg');
  });

  it('should get year from date string', () => {
    const year = component.getYear('2023-01-01');
    expect(year).toBe('2023');
  });

  it('should return empty string for invalid date', () => {
    const year = component.getYear('');
    expect(year).toBe('');
  });

  it('should truncate long text', () => {
    const text = 'This is a very long text that should be truncated';
    const truncated = component.truncateText(text, 20);
    expect(truncated).toBe('This is a very long...');
  });

  it('should not truncate short text', () => {
    const text = 'Short text';
    const result = component.truncateText(text, 20);
    expect(result).toBe('Short text');
  });


});