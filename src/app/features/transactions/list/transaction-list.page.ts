import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonContent,
  IonGesture,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonNote,
  IonSearchbar,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { chevronBackOutline, chevronForwardOutline } from 'ionicons/icons';

import { TransactionWithCategory } from '../../../core/models/transaction.model';
import { TransactionService } from '../../../core/services/transaction.service';
import { CurrencyFormatPipe } from '../../../shared/pipes/currency-format.pipe';

@Component({
  selector: 'app-transaction-list',
  standalone: true,
  imports: [
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonList, IonItem, IonLabel, IonNote, IonIcon,
    IonSearchbar,
    FormsModule, DatePipe,
    CurrencyFormatPipe,
  ],
  templateUrl: './transaction-list.page.html',
  styleUrls: ['./transaction-list.page.scss'],
})
export class TransactionListPage implements OnInit {
  currentMonth = new Date().getMonth() + 1;
  currentYear = new Date().getFullYear();

  allTransactions: TransactionWithCategory[] = [];
  filteredTransactions: TransactionWithCategory[] = [];
  searchQuery = '';
  isLoading = true;

  get monthLabel(): string {
    return new Date(this.currentYear, this.currentMonth - 1, 1).toLocaleDateString('de-DE', {
      month: 'long',
      year: 'numeric',
    });
  }

  constructor(
    private transactionService: TransactionService,
    private router: Router,
  ) {
    addIcons({ chevronBackOutline, chevronForwardOutline });
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
      this.allTransactions = await this.transactionService.getByMonth(
        this.currentYear,
        this.currentMonth,
      );
      this.applyFilter();
    } catch (err) {
      console.error('Transaktionen laden:', err);
    } finally {
      this.isLoading = false;
    }
  }

  onSearch(event: CustomEvent): void {
    this.searchQuery = (event.detail.value as string) ?? '';
    this.applyFilter();
  }

  applyFilter(): void {
    const q = this.searchQuery.toLowerCase().trim();
    this.filteredTransactions = q
      ? this.allTransactions.filter(
          (t) =>
            (t.description?.toLowerCase().includes(q) ?? false) ||
            (t.categoryName?.toLowerCase().includes(q) ?? false),
        )
      : [...this.allTransactions];
  }

  async previousMonth(): Promise<void> {
    if (this.currentMonth === 1) {
      this.currentMonth = 12;
      this.currentYear--;
    } else {
      this.currentMonth--;
    }
    await this.load();
  }

  async nextMonth(): Promise<void> {
    const now = new Date();
    if (
      this.currentYear === now.getFullYear() &&
      this.currentMonth === now.getMonth() + 1
    ) {
      return; // Kein Monat in der Zukunft
    }
    if (this.currentMonth === 12) {
      this.currentMonth = 1;
      this.currentYear++;
    } else {
      this.currentMonth++;
    }
    await this.load();
  }

  openDetail(id: number): void {
    void this.router.navigate(['/transactions', id]);
  }

  get isCurrentMonth(): boolean {
    const now = new Date();
    return (
      this.currentYear === now.getFullYear() && this.currentMonth === now.getMonth() + 1
    );
  }
}
