import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  AlertController,
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonTitle,
  IonToolbar,
  ToastController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { trashOutline } from 'ionicons/icons';

import { TransactionWithCategory } from '../../../core/models/transaction.model';
import { TransactionService } from '../../../core/services/transaction.service';
import { CategoryPickerComponent } from '../../../shared/components/category-picker/category-picker.component';
import { CurrencyFormatPipe } from '../../../shared/pipes/currency-format.pipe';

@Component({
  selector: 'app-transaction-detail',
  standalone: true,
  imports: [
    IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton, IonButton, IonContent,
    IonList, IonItem, IonLabel, IonInput, IonIcon,
    FormsModule, DatePipe,
    CategoryPickerComponent, CurrencyFormatPipe,
  ],
  templateUrl: './transaction-detail.page.html',
  styleUrls: ['./transaction-detail.page.scss'],
})
export class TransactionDetailPage implements OnInit {
  transaction: TransactionWithCategory | null = null;
  isLoading = true;
  isSaving = false;

  editDescription = '';
  editCategoryId: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private transactionService: TransactionService,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
  ) {
    addIcons({ trashOutline });
  }

  async ngOnInit(): Promise<void> {
    const id = parseInt(this.route.snapshot.paramMap.get('id') ?? '0', 10);
    try {
      this.transaction = await this.transactionService.getById(id);
      if (this.transaction) {
        this.editDescription = this.transaction.description ?? '';
        this.editCategoryId = this.transaction.categoryId;
      }
    } catch (err) {
      console.error('Transaktion laden:', err);
    } finally {
      this.isLoading = false;
    }
  }

  async save(): Promise<void> {
    if (!this.transaction || this.isSaving) return;
    this.isSaving = true;
    try {
      await this.transactionService.update(this.transaction.id, {
        description: this.editDescription.trim() || null,
        categoryId: this.editCategoryId,
      });
      const toast = await this.toastCtrl.create({
        message: 'Buchung aktualisiert',
        duration: 1500,
        color: 'success',
      });
      await toast.present();
    } catch (err) {
      console.error('Transaktion speichern:', err);
    } finally {
      this.isSaving = false;
    }
  }

  async confirmDelete(): Promise<void> {
    if (!this.transaction) return;
    const alert = await this.alertCtrl.create({
      header: 'Buchung löschen?',
      message: 'Diese Buchung wird unwiderruflich gelöscht.',
      buttons: [
        { text: 'Abbrechen', role: 'cancel' },
        {
          text: 'Löschen',
          role: 'destructive',
          handler: () => { void this.delete(); },
        },
      ],
    });
    await alert.present();
  }

  private async delete(): Promise<void> {
    if (!this.transaction) return;
    try {
      await this.transactionService.delete(this.transaction.id);
      void this.router.navigateByUrl('/transactions');
    } catch (err) {
      console.error('Transaktion löschen:', err);
    }
  }
}
