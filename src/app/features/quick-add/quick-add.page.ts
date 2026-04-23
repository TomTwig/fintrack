import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import {
  IonButton,
  IonContent,
  IonDatetime,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonModal,
  IonTitle,
  IonToolbar,
  ToastController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { calendarOutline, checkmarkCircleOutline } from 'ionicons/icons';

import { QuickEntry } from '../../core/models/transaction.model';
import { TransactionService } from '../../core/services/transaction.service';
import { AmountInputComponent } from '../../shared/components/amount-input/amount-input.component';
import { CategoryPickerComponent } from '../../shared/components/category-picker/category-picker.component';

@Component({
  selector: 'app-quick-add',
  standalone: true,
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonIcon,
    IonItem,
    IonInput,
    IonModal,
    IonDatetime,
    FormsModule,
    AmountInputComponent,
    CategoryPickerComponent,
  ],
  templateUrl: './quick-add.page.html',
  styleUrls: ['./quick-add.page.scss'],
})
export class QuickAddPage implements OnInit {
  @ViewChild(AmountInputComponent) amountInput!: AmountInputComponent;

  amount = 0;
  selectedCategoryId: number | null = null;
  description = '';
  date = new Date().toISOString().split('T')[0];
  isSaving = false;
  showDatePicker = false;

  constructor(
    private transactionService: TransactionService,
    private toastCtrl: ToastController,
  ) {
    addIcons({ calendarOutline, checkmarkCircleOutline });
  }

  ngOnInit(): void {
    this.resetForm();
  }

  onAmountChange(value: number): void {
    this.amount = value;
  }

  onCategorySelected(categoryId: number): void {
    this.selectedCategoryId = categoryId;
  }

  onDateChange(event: CustomEvent): void {
    const value = event.detail.value as string;
    this.date = value.split('T')[0];
    this.showDatePicker = false;
  }

  get formattedDate(): string {
    const d = new Date(this.date + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (d.getTime() === today.getTime()) return 'Heute';

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (d.getTime() === yesterday.getTime()) return 'Gestern';

    return d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  get canSave(): boolean {
    return this.amount > 0 && this.selectedCategoryId !== null && !this.isSaving;
  }

  async save(): Promise<void> {
    if (!this.canSave || this.selectedCategoryId === null) return;

    this.isSaving = true;
    try {
      const entry: QuickEntry = {
        amount: this.amount,
        categoryId: this.selectedCategoryId,
        description: this.description.trim() || undefined,
        date: this.date,
      };

      await this.transactionService.addQuickEntry(entry);
      await Haptics.impact({ style: ImpactStyle.Medium });
      await this.showSuccessToast();
      this.resetForm();
    } catch (err) {
      await this.showErrorToast();
      console.error('Quick-Add Fehler:', err);
    } finally {
      this.isSaving = false;
    }
  }

  private resetForm(): void {
    this.amount = 0;
    this.selectedCategoryId = null;
    this.description = '';
    this.date = new Date().toISOString().split('T')[0];
    this.amountInput?.reset();
  }

  private async showSuccessToast(): Promise<void> {
    const toast = await this.toastCtrl.create({
      message: 'Ausgabe gespeichert',
      duration: 1500,
      position: 'top',
      color: 'success',
      icon: 'checkmark-circle-outline',
    });
    await toast.present();
  }

  private async showErrorToast(): Promise<void> {
    const toast = await this.toastCtrl.create({
      message: 'Fehler beim Speichern. Bitte nochmal versuchen.',
      duration: 2500,
      position: 'top',
      color: 'danger',
    });
    await toast.present();
  }
}
