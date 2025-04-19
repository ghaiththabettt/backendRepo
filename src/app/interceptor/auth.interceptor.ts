// src/app/interceptors/auth.interceptor.ts
import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from 'app/core/service/auth.service';  // Assurez-vous de bien importer le service

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Exclure les requêtes de login/signup pour éviter d'ajouter le token
    if (!request.url.includes('/auth/signin') && !request.url.includes('/auth/signup')) {
      const currentUser = this.authService.currentUserValue;
      if (currentUser && currentUser.token) {
        // Ajoute le token JWT dans les en-têtes
        request = request.clone({
          setHeaders: {
            Authorization: `Bearer ${currentUser.token}`,  // Le token JWT
          },
        });
      }
    }
    return next.handle(request);
  }
}
