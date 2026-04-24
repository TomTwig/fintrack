import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideIonicAngular } from '@ionic/angular/standalone';
import { ArcElement, Chart, DoughnutController, Legend, Tooltip } from 'chart.js';
import { provideCharts } from 'ng2-charts';

import { routes } from './app.routes';

// Nur die Chart-Typen registrieren die wir brauchen (kein withDefaultRegisterables).
// Spart ~120 kB gegenüber dem vollständigen Chart.js-Bundle.
Chart.register(DoughnutController, ArcElement, Tooltip, Legend);

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideIonicAngular({ mode: 'md' }),
    // APP_INITIALIZER für DB entfernt – DatabaseService startet sich im
    // Hintergrund selbst. Angular rendert den App-Shell sofort.
    provideCharts(),
  ],
};
