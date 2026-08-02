import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface DonutSegment {
  label: string;
  value: number;
  color: string;
}

@Component({
  selector: 'app-donut-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './donut-chart.component.html'
})
export class DonutChartComponent {

  @Input({ required: true }) segments: DonutSegment[] = [];

  readonly size = 140;
  readonly strokeWidth = 22;
  private readonly gap = 3;

  get radius(): number {
    return (this.size - this.strokeWidth) / 2;
  }

  get circumference(): number {
    return 2 * Math.PI * this.radius;
  }

  get total(): number {
    return this.segments.reduce((sum, s) => sum + s.value, 0);
  }

  dashArrayFor(segment: DonutSegment): string {
    const length = Math.max((segment.value / this.total) * this.circumference - this.gap, 0);
    return `${length} ${this.circumference - length}`;
  }

  offsetFor(index: number): number {
    const before = this.segments.slice(0, index).reduce((sum, s) => sum + s.value, 0);
    return -(before / this.total) * this.circumference;
  }

  percentFor(segment: DonutSegment): number {
    return Math.round((segment.value / this.total) * 100);
  }
}
