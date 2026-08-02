import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-logo-mark',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './logo-mark.component.html'
})
export class LogoMarkComponent {
  @Input() size = 36;

  get topHeight(): number {
    return Math.round(this.size * 0.58);
  }

  get bottomHeight(): number {
    return Math.round(this.size * 0.36);
  }
}
