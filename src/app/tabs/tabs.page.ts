import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { addIcons } from 'ionicons';
import { flashOutline, homeOutline, listOutline, repeatOutline } from 'ionicons/icons';
import { IonIcon, IonLabel, IonRouterOutlet, IonTabBar, IonTabButton } from '@ionic/angular/standalone';

@Component({
  selector: 'app-tabs',
  standalone: true,
  imports: [IonRouterOutlet, IonTabBar, IonTabButton, IonIcon, IonLabel, RouterLink, RouterLinkActive],
  template: `
    <ion-router-outlet></ion-router-outlet>
    <ion-tab-bar>
      <ion-tab-button routerLink="/dashboard" routerLinkActive #rla0="routerLinkActive" [selected]="rla0.isActive">
        <ion-icon name="home-outline"></ion-icon>
        <ion-label>Übersicht</ion-label>
      </ion-tab-button>
      <ion-tab-button routerLink="/quick-add" routerLinkActive #rla1="routerLinkActive" [selected]="rla1.isActive">
        <ion-icon name="flash-outline"></ion-icon>
        <ion-label>Schnelleingabe</ion-label>
      </ion-tab-button>
      <ion-tab-button routerLink="/transactions" routerLinkActive #rla2="routerLinkActive" [selected]="rla2.isActive">
        <ion-icon name="list-outline"></ion-icon>
        <ion-label>Buchungen</ion-label>
      </ion-tab-button>
      <ion-tab-button routerLink="/fixed-costs" routerLinkActive #rla3="routerLinkActive" [selected]="rla3.isActive">
        <ion-icon name="repeat-outline"></ion-icon>
        <ion-label>Fixkosten</ion-label>
      </ion-tab-button>
    </ion-tab-bar>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
    }
    ion-router-outlet {
      flex: 1;
      position: relative;
    }
  `],
})
export class TabsPage {
  constructor() {
    addIcons({ homeOutline, flashOutline, listOutline, repeatOutline });
  }
}
