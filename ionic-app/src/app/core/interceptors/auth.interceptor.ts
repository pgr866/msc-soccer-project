import { HttpInterceptorFn, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '@/app/core/services/auth.service';
import { from, switchMap } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const authService = inject(AuthService);

  return from(authService.getToken()).pipe(
    switchMap((token: string | null) => {
      if (token) {
        const authReq = req.clone({ headers: req.headers.set('Authorization', `Bearer ${token}`) });
        return next(authReq);
      }
      return next(req);
    })
  );
};
