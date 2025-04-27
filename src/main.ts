import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from 'app/app.component';
import { appConfig } from 'app/app.config';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { AuthInterceptor } from 'app/core/interceptor/auth.interceptor';
import { importProvidersFrom } from '@angular/core';
import { environment } from './environments/environment';

// Import Firebase - Version simplifiée pour compatibilité
import { initializeApp } from 'firebase/app';

// Chart.js config
import { Chart, DoughnutController, ArcElement, Tooltip, Legend } from 'chart.js';
Chart.register(DoughnutController, ArcElement, Tooltip, Legend);

// Initialiser Firebase manuellement
const app = initializeApp(environment.firebase);

// 👇 Configuration sans importProviders Firebase pour éviter les erreurs
bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(withInterceptors([AuthInterceptor])),
    ...appConfig.providers // autres providers existants
  ]
}).catch((err) => console.error(err));
