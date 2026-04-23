import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonButton, IonIcon, IonText } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { backspaceOutline } from 'ionicons/icons';

@Component({
  selector: 'app-amount-input',
  standalone: true,
  imports: [IonButton, IonIcon, IonText, FormsModule],
  templateUrl: './amount-input.component.html',
  styleUrls: ['./amount-input.component.scss'],
})
export class AmountInputComponent implements OnInit {
  @Input() currency = '€';
  @Output() amountChange = new EventEmitter<number>();

  displayValue = '0';
  private rawValue = '';

  readonly numpadKeys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', ',', '0', 'del'];

  constructor() {
    addIcons({ backspaceOutline });
  }

  ngOnInit(): void {
    this.reset();
  }

  onKey(key: string): void {
    if (key === 'del') {
      this.deleteLast();
      return;
    }

    if (key === ',') {
      if (this.rawValue.includes(',')) return;
      if (this.rawValue.length === 0) this.rawValue = '0';
      this.rawValue += ',';
    } else {
      // Max 2 Dezimalstellen
      const commaIndex = this.rawValue.indexOf(',');
      if (commaIndex !== -1 && this.rawValue.length - commaIndex > 2) return;

      // Max 7 Stellen vor dem Komma
      if (commaIndex === -1 && this.rawValue.replace(/^0/, '').length >= 7) return;

      if (this.rawValue === '0') {
        this.rawValue = key;
      } else {
        this.rawValue += key;
      }
    }

    this.updateDisplay();
    this.emitValue();
  }

  private deleteLast(): void {
    if (this.rawValue.length <= 1) {
      this.rawValue = '0';
    } else {
      this.rawValue = this.rawValue.slice(0, -1);
    }
    this.updateDisplay();
    this.emitValue();
  }

  private updateDisplay(): void {
    this.displayValue = this.rawValue || '0';
  }

  private emitValue(): void {
    const numericValue = parseFloat(this.rawValue.replace(',', '.')) || 0;
    this.amountChange.emit(numericValue);
  }

  reset(): void {
    this.rawValue = '0';
    this.displayValue = '0';
    this.amountChange.emit(0);
  }

  get currentAmount(): number {
    return parseFloat(this.rawValue.replace(',', '.')) || 0;
  }
}
