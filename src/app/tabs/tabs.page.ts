import { Component } from '@angular/core';
import { addIcons } from 'ionicons';
import { flashOutline, homeOutline, listOutline, repeatOutline, settingsOutline } from 'ionicons/icons';
import {
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-tabs',
  standalone: true,
  imports: [IonTabs, IonRouterOutlet, IonTabBar, IonTabButton, IonIcon, IonLabel],
  template: `
    <ion-tabs>
      <ion-router-outlet></ion-router-outlet>
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
    </ion-tabs>
  `,
})
export class TabsPage {
  constructor() {
    addIcons({ homeOutline, flashOutline, listOutline, repeatOutline, settingsOutline });
  }
}
