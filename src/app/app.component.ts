import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { App } from '@capacitor/app';
import { IonApp, IonRouterOutlet, IonTabBar, IonTabButton, IonTabs, IonIcon, IonLabel } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  homeOutline,
  flashOutline,
  listOutline,
  repeatOutline,
  settingsOutline,
} from 'ionicons/icons';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [IonApp, IonRouterOutlet, IonTabBar, IonTabButton, IonTabs, IonIcon, IonLabel],
  template: `
    <ion-app>
      <ion-tabs>
        <ion-tab-bar slot="bottom">
          <ion-tab-button tab="dashboard" href="/dashboard">
            <ion-icon name="home-outline" />
            <ion-label>Übersicht</ion-label>
          </ion-tab-button>
          <ion-tab-button tab="quick-add" href="/quick-add">
            <ion-icon name="flash-outline" />
            <ion-label>Schnelleingabe</ion-label>
          </ion-tab-button>
          <ion-tab-button tab="transactions" href="/transactions">
            <ion-icon name="list-outline" />
            <ion-label>Buchungen</ion-label>
          </ion-tab-button>
          <ion-tab-button tab="fixed-costs" href="/fixed-costs">
            <ion-icon name="repeat-outline" />
            <ion-label>Fixkosten</ion-label>
          </ion-tab-button>
          <ion-tab-button tab="settings" href="/settings">
            <ion-icon name="settings-outline" />
            <ion-label>Einstellungen</ion-label>
          </ion-tab-button>
        </ion-tab-bar>
        <ion-router-outlet />
      </ion-tabs>
    </ion-app>
  `,
})
export class AppComponent implements OnInit {
  constructor(private router: Router) {
    addIcons({
      homeOutline,
      flashOutline,
      listOutline,
      repeatOutline,
      settingsOutline,
    });
  }

  ngOnInit(): void {
    this.setupDeepLinks();
  }

  private setupDeepLinks(): void {
    App.addListener('appUrlOpen', (data) => {
      if (data.url.includes('quick-add')) {
        void this.router.navigateByUrl('/quick-add');
      }
    });
  }
}
