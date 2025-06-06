import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, NavigationEnd, Event } from '@angular/router';
import { Subject } from 'rxjs';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let router: jasmine.SpyObj<Router>;
  let routerEventsSubject: Subject<Event>;
  
  beforeEach(async () => {
    routerEventsSubject = new Subject();
    const routerSpy = jasmine.createSpyObj('Router', [], {
      events: routerEventsSubject.asObservable(),
      url: '/'
    });

    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show hero banner by default', () => {
    expect(component.showHeroBanner).toBe(true);
  });

  it('should hide hero banner on movie details page', () => {
    component.ngOnInit();
    
    routerEventsSubject.next(new NavigationEnd(1, '/movie/123', '/movie/123'));
    
    expect(component.showHeroBanner).toBe(false);
  });

  it('should show hero banner on home page', () => {
    component.showHeroBanner = false;
    component.ngOnInit();
    
    routerEventsSubject.next(new NavigationEnd(1, '/', '/'));
    
    expect(component.showHeroBanner).toBe(true);
  });

  it('should unsubscribe on destroy', () => {
    component.ngOnInit();
    const subscription = component['routerSubscription'];
    if (subscription) {
      spyOn(subscription, 'unsubscribe');
      
      component.ngOnDestroy();
      
      expect(subscription.unsubscribe).toHaveBeenCalled();
    }
  });
});