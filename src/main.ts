import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from 'app/app.component';
import { appConfig } from 'app/app.config';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { AuthInterceptor } from 'app/core/interceptor/auth.interceptor';

// Chart.js config
import { Chart, DoughnutController, ArcElement, Tooltip, Legend } from 'chart.js';
Chart.register(DoughnutController, ArcElement, Tooltip, Legend);

// 👇 Ajouter l'intercepteur ici
bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(withInterceptors([AuthInterceptor])),
    ...appConfig.providers // si tu as d'autres providers
  ]
}).catch((err) => console.error(err));
