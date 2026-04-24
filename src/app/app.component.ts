import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { App } from '@capacitor/app';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [IonApp, IonRouterOutlet],
  template: `
    <ion-app>
      <ion-router-outlet />
    </ion-app>
  `,
})
export class AppComponent implements OnInit {
  constructor(private router: Router) {}

  ngOnInit(): void {
    this.removeSplash();
    this.setupDeepLinks();
  }

  private removeSplash(): void {
    // Splash sofort ausblenden sobald Angular gerendert hat
    requestAnimationFrame(() => {
      const splash = document.getElementById('ft-splash');
      if (!splash) return;
      splash.classList.add('ft-out');
      setTimeout(() => splash.remove(), 250);
    });
  }

  private setupDeepLinks(): void {
    App.addListener('appUrlOpen', (data) => {
      if (data.url.includes('quick-add')) {
        void this.router.navigateByUrl('/quick-add');
      }
    });
  }
}
