import { APP_INITIALIZER, ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideIonicAngular } from '@ionic/angular/standalone';

import { DatabaseService } from './core/services/database.service';

import { routes } from './app.routes';

function initializeDatabase(db: DatabaseService): () => Promise<void> {
  return () => db.initialize();
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideIonicAngular({
      mode: 'md', // Material Design auf allen Plattformen (konsistentes Look & Feel)
    }),
    {
      provide: APP_INITIALIZER,
      useFactory: initializeDatabase,
      deps: [DatabaseService],
      multi: true,
    },
  ],
};
