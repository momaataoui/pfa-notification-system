import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-meter',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './meter.component.html'
})
export class MeterComponent {

  @Input({ required: true }) value = 0;
  @Input() color = '#0ca30c';
  @Input() trackColor = '#d7f0d7';
  @Input() label = '';

  readonly size = 140;
  readonly strokeWidth = 14;

  get radius(): number {
    return (this.size - this.strokeWidth) / 2;
  }

  get circumference(): number {
    return 2 * Math.PI * this.radius;
  }

  get dashArray(): string {
    const clamped = Math.min(Math.max(this.value, 0), 100);
    const filled = (clamped / 100) * this.circumference;
    return `${filled} ${this.circumference - filled}`;
  }
}
