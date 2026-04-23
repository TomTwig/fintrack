import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonNote,
  IonSelect,
  IonSelectOption,
  IonTextarea,
  IonTitle,
  IonToggle,
  IonToolbar,
  ToastController,
} from '@ionic/angular/standalone';

import { BillingCycle, NewFixedCost } from '../../../core/models/fixed-cost.model';
import { CategoryPickerComponent } from '../../../shared/components/category-picker/category-picker.component';
import { FixedCostService } from '../../../core/services/fixed-cost.service';

@Component({
  selector: 'app-fixed-cost-form',
  standalone: true,
  imports: [
    IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent,
    IonList, IonItem, IonLabel, IonInput, IonNote, IonSelect, IonSelectOption,
    IonTextarea, IonToggle,
    FormsModule,
    CategoryPickerComponent,
  ],
  templateUrl: './fixed-cost-form.page.html',
  styleUrls: ['./fixed-cost-form.page.scss'],
})
export class FixedCostFormPage implements OnInit {
  editId: number | null = null;
  isEditMode = false;

  name = '';
  amount = 0;
  amountDisplay = '';
  selectedCategoryId: number | null = null;
  billingDay = 1;
  billingCycle: BillingCycle = 'monthly';
  isActive = true;
  notes = '';
  isSaving = false;

  readonly billingDays = Array.from({ length: 31 }, (_, i) => i + 1);
  readonly cycles: { value: BillingCycle; label: string }[] = [
    { value: 'monthly',   label: 'Monatlich' },
    { value: 'quarterly', label: 'Vierteljährlich' },
    { value: 'yearly',    label: 'Jährlich' },
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fixedCostService: FixedCostService,
    private toastCtrl: ToastController,
  ) {}

  async ngOnInit(): Promise<void> {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.editId = parseInt(idParam, 10);
      this.isEditMode = true;
      await this.loadExisting();
    }
  }

  private async loadExisting(): Promise<void> {
    if (!this.editId) return;
    const fc = await this.fixedCostService.getById(this.editId);
    if (!fc) return;

    this.name = fc.name;
    this.amount = fc.amount;
    this.amountDisplay = fc.amount.toFixed(2).replace('.', ',');
    this.selectedCategoryId = fc.categoryId;
    this.billingDay = fc.billingDay;
    this.billingCycle = fc.billingCycle;
    this.isActive = fc.isActive;
    this.notes = fc.notes ?? '';
  }

  onAmountInput(event: Event): void {
    const input = (event.target as HTMLInputElement).value;
    const numeric = parseFloat(input.replace(',', '.'));
    this.amount = isNaN(numeric) ? 0 : numeric;
  }

  get isValid(): boolean {
    return (
      this.name.trim().length > 0 &&
      this.amount > 0 &&
      this.billingDay >= 1 &&
      this.billingDay <= 31
    );
  }

  async save(): Promise<void> {
    if (!this.isValid || this.isSaving) return;

    this.isSaving = true;
    try {
      const data: NewFixedCost = {
        name: this.name.trim(),
        amount: this.amount,
        categoryId: this.selectedCategoryId,
        billingDay: this.billingDay,
        billingCycle: this.billingCycle,
        isActive: this.isActive,
        notes: this.notes.trim() || null,
      };

      if (this.isEditMode && this.editId) {
        await this.fixedCostService.update(this.editId, data);
      } else {
        await this.fixedCostService.create(data);
      }

      const toast = await this.toastCtrl.create({
        message: this.isEditMode ? 'Fixkosten aktualisiert' : 'Fixkosten gespeichert',
        duration: 1500,
        color: 'success',
      });
      await toast.present();
      void this.router.navigateByUrl('/fixed-costs');
    } catch (err) {
      const toast = await this.toastCtrl.create({
        message: 'Fehler beim Speichern',
        duration: 2000,
        color: 'danger',
      });
      await toast.present();
      console.error('Fixkosten speichern:', err);
    } finally {
      this.isSaving = false;
    }
  }

  cancel(): void {
    void this.router.navigateByUrl('/fixed-costs');
  }
}
