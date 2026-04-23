import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  AlertController,
  IonButton,
  IonButtons,
  IonContent,
  IonFab,
  IonFabButton,
  IonHeader,
  IonIcon,
  IonItem,
  IonItemOption,
  IonItemOptions,
  IonItemSliding,
  IonLabel,
  IonList,
  IonListHeader,
  IonNote,
  IonTitle,
  IonToggle,
  IonToolbar,
  ToastController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { addOutline, createOutline, trashOutline } from 'ionicons/icons';

import { BillingCycle, FixedCostWithCategory } from '../../../core/models/fixed-cost.model';
import { FixedCostService } from '../../../core/services/fixed-cost.service';
import { CurrencyFormatPipe } from '../../../shared/pipes/currency-format.pipe';

type GroupedCosts = Record<BillingCycle, FixedCostWithCategory[]>;

@Component({
  selector: 'app-fixed-cost-list',
  standalone: true,
  imports: [
    IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent,
    IonList, IonListHeader, IonItem, IonLabel, IonNote, IonIcon, IonToggle,
    IonItemSliding, IonItemOptions, IonItemOption,
    IonFab, IonFabButton,
    CurrencyFormatPipe,
  ],
  templateUrl: './fixed-cost-list.page.html',
  styleUrls: ['./fixed-cost-list.page.scss'],
})
export class FixedCostListPage implements OnInit {
  fixedCosts: FixedCostWithCategory[] = [];
  grouped: GroupedCosts = { monthly: [], quarterly: [], yearly: [] };
  isLoading = true;

  readonly cycleLabels: Record<BillingCycle, string> = {
    monthly: 'Monatlich',
    quarterly: 'Vierteljährlich',
    yearly: 'Jährlich',
  };

  constructor(
    private fixedCostService: FixedCostService,
    private router: Router,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
  ) {
    addIcons({ addOutline, createOutline, trashOutline });
  }

  async ngOnInit(): Promise<void> {
    await this.load();
  }

  async ionViewWillEnter(): Promise<void> {
    await this.load();
  }

  async load(): Promise<void> {
    this.isLoading = true;
    try {
      this.fixedCosts = await this.fixedCostService.getAll();
      this.grouped = { monthly: [], quarterly: [], yearly: [] };
      for (const fc of this.fixedCosts) {
        this.grouped[fc.billingCycle].push(fc);
      }
    } catch (err) {
      console.error('Fixkosten laden:', err);
    } finally {
      this.isLoading = false;
    }
  }

  navigateToForm(id?: number): void {
    void this.router.navigateByUrl(id ? `/fixed-costs/${id}/edit` : '/fixed-costs/new');
  }

  async toggleActive(fc: FixedCostWithCategory): Promise<void> {
    try {
      await this.fixedCostService.update(fc.id, { isActive: !fc.isActive });
      fc.isActive = !fc.isActive;
    } catch (err) {
      console.error('Toggle aktiv:', err);
    }
  }

  async markAsPaid(fc: FixedCostWithCategory): Promise<void> {
    try {
      await this.fixedCostService.markAsPaid(fc);
      const toast = await this.toastCtrl.create({
        message: `${fc.name} als bezahlt markiert`,
        duration: 2000,
        color: 'success',
      });
      await toast.present();
    } catch (err) {
      console.error('Als bezahlt markieren:', err);
    }
  }

  async confirmDelete(fc: FixedCostWithCategory): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Löschen?',
      message: `„${fc.name}" wirklich löschen?`,
      buttons: [
        { text: 'Abbrechen', role: 'cancel' },
        {
          text: 'Löschen',
          role: 'destructive',
          handler: () => {
            void this.delete(fc);
          },
        },
      ],
    });
    await alert.present();
  }

  private async delete(fc: FixedCostWithCategory): Promise<void> {
    try {
      await this.fixedCostService.delete(fc.id);
      await this.load();
    } catch (err) {
      console.error('Fixkosten löschen:', err);
    }
  }

  getCycles(): BillingCycle[] {
    return (['monthly', 'quarterly', 'yearly'] as BillingCycle[]).filter(
      (c) => this.grouped[c].length > 0,
    );
  }

  getMonthlyTotal(): number {
    return this.fixedCostService.getMonthlyTotal(this.fixedCosts);
  }
}
