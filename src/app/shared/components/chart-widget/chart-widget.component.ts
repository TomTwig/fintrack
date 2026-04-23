import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ChartData, ChartOptions } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';

import { CategorySummary } from '../../../core/models/transaction.model';

@Component({
  selector: 'app-chart-widget',
  standalone: true,
  imports: [BaseChartDirective],
  template: `
    @if (hasData) {
      <div class="chart-container">
        <canvas baseChart
          [data]="chartData"
          [options]="chartOptions"
          type="doughnut"
        ></canvas>
      </div>
    } @else {
      <div class="chart-empty">
        <p>Keine Ausgaben im gewählten Zeitraum</p>
      </div>
    }
  `,
  styles: [`
    .chart-container {
      position: relative;
      height: 200px;
      display: flex;
      justify-content: center;
    }
    .chart-empty {
      height: 200px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--ion-color-medium);
      font-size: 14px;
    }
  `],
})
export class ChartWidgetComponent implements OnChanges {
  @Input() summaries: CategorySummary[] = [];

  hasData = false;

  chartData: ChartData<'doughnut'> = {
    labels: [],
    datasets: [{ data: [], backgroundColor: [], borderWidth: 0 }],
  };

  chartOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const value = ctx.raw as number;
            return ` ${new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(value)}`;
          },
        },
      },
    },
  };

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['summaries']) {
      this.buildChart();
    }
  }

  private buildChart(): void {
    this.hasData = this.summaries.length > 0;
    if (!this.hasData) return;

    this.chartData = {
      labels: this.summaries.map((s) => s.categoryName),
      datasets: [
        {
          data: this.summaries.map((s) => s.total),
          backgroundColor: this.summaries.map((s) => s.categoryColor),
          borderWidth: 0,
          hoverOffset: 8,
        },
      ],
    };
  }
}
