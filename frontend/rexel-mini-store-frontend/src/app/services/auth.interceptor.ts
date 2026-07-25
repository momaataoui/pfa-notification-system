import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { from, switchMap } from 'rxjs';
import { AuthService } from './auth.service';

const API_URL_PATTERN = /^http:\/\/localhost:(8081|8080)\/api\//;

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  if (!API_URL_PATTERN.test(req.url) || !authService.keycloak.authenticated) {
    return next(req);
  }

  return from(authService.keycloak.updateToken(30)).pipe(
    switchMap(() => {
      const authReq = req.clone({
        setHeaders: { Authorization: `Bearer ${authService.keycloak.token}` }
      });
      return next(authReq);
    })
  );
};
