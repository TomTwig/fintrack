import { enableProdMode } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { Capacitor } from '@capacitor/core';
import { defineCustomElements as jeepSqlite } from 'jeep-sqlite/loader';

import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

// Registriert das <jeep-sqlite> Web Component für den Browser
if (Capacitor.getPlatform() === 'web') {
  jeepSqlite(window);
}

bootstrapApplication(AppComponent, appConfig).catch((err) => console.error(err));
