import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HTTP_INTERCEPTORS,
  HttpResponse,
} from '@angular/common/http';
import { Injectable, Provider, inject } from '@angular/core';
import { map, Observable } from 'rxjs';
import { AuthService } from '../lib/services/timesheet/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  auth = inject(AuthService);

  intercept(
    req: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    if (this.auth.getUserTokenLocalStorage()) {
      req = req.clone({
        setHeaders: {
          Authorization: `Bearer ${this.auth.getUserTokenLocalStorage()}`,
        },
      });
    }

    return next.handle(req).pipe(
      map((event: HttpEvent<unknown>) => {
        if (
          event instanceof HttpResponse &&
          event.status === 200 &&
          typeof event.body === 'string'
        ) {
          try {
            const mappedResponse = JSON.parse(event.body);
            return event.clone({ body: mappedResponse });
          } catch {
            return event;
          }
        }
        return event;
      })
    );
  }
}

export const AUTH_INTERCEPTOR_PROVIDER: Provider = {
  provide: HTTP_INTERCEPTORS,
  useClass: AuthInterceptor,
  multi: true,
};
