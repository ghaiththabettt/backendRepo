import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../service/auth.service';

export const AuthInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const currentUser = authService.currentUserValue;
  
  console.log('🔥 Interceptor running — current user:', currentUser);

  // Vérifie plusieurs possibilités de récupération du token
  let token = null;
  
  if (currentUser) {
    // Différentes façons possibles de stocker le token selon l'API
    token = currentUser.token || currentUser.accessToken || currentUser.tokenType === 'Bearer' && currentUser.accessToken;
    
    console.log('Token from currentUser:', token ? 'Token found' : 'No token found');
  }
  
  // Fallback: essayer de récupérer directement depuis localStorage
  if (!token) {
    // Essayer plusieurs noms possibles pour le token dans localStorage
    token = localStorage.getItem('token') || localStorage.getItem('accessToken');
    console.log('Token from localStorage:', token ? 'Token found' : 'No token found');
  }

  if (token) {
    console.log('Adding Authorization header with Bearer token');
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  } else {
    console.warn('No token available for authentication');
  }

  return next(req);
  
};
