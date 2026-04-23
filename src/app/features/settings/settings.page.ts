import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  AlertController,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonNote,
  IonSelect,
  IonSelectOption,
  IonTitle,
  IonToolbar,
  ToastController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  colorPaletteOutline,
  informationCircleOutline,
  languageOutline,
  trashOutline,
} from 'ionicons/icons';

import { DatabaseService } from '../../core/services/database.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonList, IonListHeader, IonItem, IonLabel, IonNote, IonIcon,
    IonSelect, IonSelectOption,
    FormsModule,
  ],
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage {
  currency = 'EUR';
  readonly appVersion = '1.0.0';

  readonly currencies = [
    { value: 'EUR', label: '€ Euro' },
    { value: 'CHF', label: 'CHF Schweizer Franken' },
    { value: 'USD', label: '$ US-Dollar' },
    { value: 'GBP', label: '£ Britisches Pfund' },
  ];

  constructor(
    private db: DatabaseService,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
  ) {
    addIcons({ colorPaletteOutline, languageOutline, trashOutline, informationCircleOutline });
  }

  async confirmReset(): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Alle Daten löschen?',
      message:
        'Alle Buchungen und Fixkosten werden unwiderruflich gelöscht. Kategorien bleiben erhalten.',
      buttons: [
        { text: 'Abbrechen', role: 'cancel' },
        {
          text: 'Löschen',
          role: 'destructive',
          handler: () => { void this.resetData(); },
        },
      ],
    });
    await alert.present();
  }

  private async resetData(): Promise<void> {
    try {
      const db = this.db.getDb();
      await db.run('DELETE FROM transactions');
      await db.run('DELETE FROM fixed_costs');
      const toast = await this.toastCtrl.create({
        message: 'Alle Daten gelöscht',
        duration: 2000,
        color: 'warning',
      });
      await toast.present();
    } catch (err) {
      console.error('Daten löschen:', err);
    }
  }
}
