import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { AuthService } from '@/app/core/services/auth.service';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { User } from '@/app/core/models/user.model';

export const authGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot, 
  state: RouterStateSnapshot
): Observable<boolean | UrlTree> => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  return authService.user$.pipe(
    map((user: User | null): boolean | UrlTree => {
      if (!user) return router.createUrlTree(['/login']);
      const requiredRole = route.data['role'];
      if (requiredRole && user.role !== requiredRole) return router.createUrlTree(['/home']);
      return true;
    })
  );
};
