import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface LineChartSeries {
  name: string;
  color: string;
  values: number[];
}

@Component({
  selector: 'app-line-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './line-chart.component.html'
})
export class LineChartComponent {

  @Input({ required: true }) labels: string[] = [];
  @Input({ required: true }) series: LineChartSeries[] = [];

  @ViewChild('svgEl') svgRef!: ElementRef<SVGSVGElement>;

  readonly width = 600;
  readonly height = 220;
  readonly paddingLeft = 30;
  readonly paddingRight = 36;
  readonly paddingTop = 10;
  readonly paddingBottom = 22;

  hoverIndex: number | null = null;

  get plotWidth(): number {
    return this.width - this.paddingLeft - this.paddingRight;
  }

  get plotHeight(): number {
    return this.height - this.paddingTop - this.paddingBottom;
  }

  get maxValue(): number {
    const all = this.series.flatMap(s => s.values);
    const max = Math.max(1, ...all);
    const magnitude = Math.pow(10, Math.floor(Math.log10(max)));
    return Math.ceil(max / magnitude) * magnitude;
  }

  get yTicks(): number[] {
    const steps = 4;
    return Array.from({ length: steps + 1 }, (_, i) => Math.round((this.maxValue / steps) * i));
  }

  xFor(index: number): number {
    if (this.labels.length <= 1) {
      return this.paddingLeft;
    }
    return this.paddingLeft + (index / (this.labels.length - 1)) * this.plotWidth;
  }

  yFor(value: number): number {
    return this.paddingTop + this.plotHeight - (value / this.maxValue) * this.plotHeight;
  }

  pathFor(series: LineChartSeries): string {
    return series.values.map((v, i) => `${i === 0 ? 'M' : 'L'} ${this.xFor(i)} ${this.yFor(v)}`).join(' ');
  }

  onMouseMove(event: MouseEvent): void {
    const svg = this.svgRef.nativeElement;
    const rect = svg.getBoundingClientRect();
    const scaleX = this.width / rect.width;
    const xInSvg = (event.clientX - rect.left) * scaleX;
    const relative = (xInSvg - this.paddingLeft) / this.plotWidth;
    const index = Math.round(relative * (this.labels.length - 1));
    this.hoverIndex = Math.min(Math.max(index, 0), this.labels.length - 1);
  }

  onMouseLeave(): void {
    this.hoverIndex = null;
  }

  get crosshairX(): number {
    return this.hoverIndex !== null ? this.xFor(this.hoverIndex) : 0;
  }

  get tooltipLeftPercent(): number {
    if (this.hoverIndex === null) {
      return 0;
    }
    const pct = (this.crosshairX / this.width) * 100;
    return Math.min(Math.max(pct, 15), 85);
  }
}
