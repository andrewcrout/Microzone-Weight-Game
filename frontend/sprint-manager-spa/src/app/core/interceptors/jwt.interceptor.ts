import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../auth/auth.service';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.token();
  if (!token) {
    return next(req);
  }

  const authorizedRequest = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });

  return next(authorizedRequest).pipe(
    catchError((error: unknown) => {
      if (shouldLogoutOnUnauthorized(error, authorizedRequest.url)) {
        auth.logout();
      }

      return throwError(() => error);
    })
  );
};

function shouldLogoutOnUnauthorized(error: unknown, url: string): boolean {
  return error instanceof HttpErrorResponse
    && error.status === 401
    && !isAuthEndpoint(url);
}

function isAuthEndpoint(url: string): boolean {
  return url.includes('/auth/login') || url.includes('/auth/register');
}
