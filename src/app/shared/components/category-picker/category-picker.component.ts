import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { IonIcon } from '@ionic/angular/standalone';

import { Category, CategoryType } from '../../../core/models/category.model';
import { CategoryService } from '../../../core/services/category.service';

@Component({
  selector: 'app-category-picker',
  standalone: true,
  imports: [IonIcon],
  templateUrl: './category-picker.component.html',
  styleUrls: ['./category-picker.component.scss'],
})
export class CategoryPickerComponent implements OnInit, OnChanges {
  @Input() filterType: CategoryType | null = null;
  @Input() selectedCategoryId: number | null = null;
  @Output() categorySelected = new EventEmitter<Category>();

  categories: Category[] = [];

  constructor(private categoryService: CategoryService) {}

  async ngOnInit(): Promise<void> {
    await this.loadCategories();
  }

  async ngOnChanges(changes: SimpleChanges): Promise<void> {
    if (changes['filterType']) {
      await this.loadCategories();
    }
  }

  select(category: Category): void {
    this.selectedCategoryId = category.id;
    this.categorySelected.emit(category);
  }

  private async loadCategories(): Promise<void> {
    this.categories = this.filterType
      ? await this.categoryService.getByType(this.filterType)
      : await this.categoryService.getAll();
  }
}
