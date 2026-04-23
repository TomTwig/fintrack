import { CurrencyPipe, NgStyle } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonChip,
  IonContent,
  IonFab,
  IonFabButton,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonSkeletonText,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { addOutline, alertCircleOutline, checkmarkCircleOutline } from 'ionicons/icons';

import { FixedCostWithCategory, isFixedCostDueThisMonth } from '../../core/models/fixed-cost.model';
import { CategorySummary, MonthSummary, TransactionWithCategory } from '../../core/models/transaction.model';
import { FixedCostService } from '../../core/services/fixed-cost.service';
import { TransactionService } from '../../core/services/transaction.service';
import { ChartWidgetComponent } from '../../shared/components/chart-widget/chart-widget.component';
import { CurrencyFormatPipe } from '../../shared/pipes/currency-format.pipe';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonCard, IonCardHeader, IonCardTitle, IonCardContent,
    IonList, IonItem, IonLabel, IonIcon, IonChip,
    IonFab, IonFabButton, IonButton, IonSkeletonText,
    NgStyle, CurrencyPipe,
    ChartWidgetComponent, CurrencyFormatPipe,
  ],
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit {
  isLoading = true;
  currentMonth = new Date().getMonth() + 1;
  currentYear = new Date().getFullYear();

  monthSummary: MonthSummary | null = null;
  recentTransactions: TransactionWithCategory[] = [];
  dueFixedCosts: (FixedCostWithCategory & { isPaid: boolean })[] = [];
  categorySummaries: CategorySummary[] = [];

  readonly monthName = new Date().toLocaleDateString('de-DE', { month: 'long', year: 'numeric' });

  constructor(
    private transactionService: TransactionService,
    private fixedCostService: FixedCostService,
    private router: Router,
  ) {
    addIcons({ addOutline, checkmarkCircleOutline, alertCircleOutline });
  }

  async ngOnInit(): Promise<void> {
    await this.loadDashboard();
  }

  async ionViewWillEnter(): Promise<void> {
    await this.loadDashboard();
  }

  async loadDashboard(): Promise<void> {
    this.isLoading = true;
    try {
      const [summary, recent, fixedCosts, categories] = await Promise.all([
        this.transactionService.getMonthSummary(this.currentYear, this.currentMonth),
        this.transactionService.getRecent(5),
        this.fixedCostService.getActive(),
        this.transactionService.getCategorySummary(this.currentYear, this.currentMonth),
      ]);

      this.monthSummary = summary;
      this.recentTransactions = recent;
      this.categorySummaries = categories;

      this.dueFixedCosts = await Promise.all(
        fixedCosts
          .filter((fc) => isFixedCostDueThisMonth(fc))
          .map(async (fc) => ({
            ...fc,
            isPaid: await this.fixedCostService.isPaidThisMonth(fc.id),
          })),
      );
    } catch (err) {
      console.error('Dashboard-Ladefehler:', err);
    } finally {
      this.isLoading = false;
    }
  }

  navigateToQuickAdd(): void {
    void this.router.navigateByUrl('/quick-add');
  }

  navigateToTransactions(): void {
    void this.router.navigateByUrl('/transactions');
  }

  navigateToFixedCosts(): void {
    void this.router.navigateByUrl('/fixed-costs');
  }
}
