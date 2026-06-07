import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { authGuard, guestGuard } from './auth.guard';
import { RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';

describe('Auth Guards', () => {
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: routerSpy }
      ]
    });
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('authGuard', () => {
    it('should return true and not redirect if logged in', () => {
      localStorage.setItem('isLoggedIn', 'true');
      const routeSnapshot = {} as ActivatedRouteSnapshot;
      const stateSnapshot = {} as RouterStateSnapshot;

      const result = TestBed.runInInjectionContext(() => authGuard(routeSnapshot, stateSnapshot));

      expect(result).toBe(true);
      expect(routerSpy.navigate).not.toHaveBeenCalled();
    });

    it('should return false and redirect to login if not logged in', () => {
      const routeSnapshot = {} as ActivatedRouteSnapshot;
      const stateSnapshot = {} as RouterStateSnapshot;

      const result = TestBed.runInInjectionContext(() => authGuard(routeSnapshot, stateSnapshot));

      expect(result).toBe(false);
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
    });
  });

  describe('guestGuard', () => {
    it('should return true and not redirect if not logged in', () => {
      const routeSnapshot = {} as ActivatedRouteSnapshot;
      const stateSnapshot = {} as RouterStateSnapshot;

      const result = TestBed.runInInjectionContext(() => guestGuard(routeSnapshot, stateSnapshot));

      expect(result).toBe(true);
      expect(routerSpy.navigate).not.toHaveBeenCalled();
    });

    it('should return false and redirect to employees if logged in', () => {
      localStorage.setItem('isLoggedIn', 'true');
      const routeSnapshot = {} as ActivatedRouteSnapshot;
      const stateSnapshot = {} as RouterStateSnapshot;

      const result = TestBed.runInInjectionContext(() => guestGuard(routeSnapshot, stateSnapshot));

      expect(result).toBe(false);
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/employees']);
    });
  });
});
