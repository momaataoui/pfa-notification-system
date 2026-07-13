import { Component } from '@angular/core';

@Component({
  selector: 'app-spinner',
  standalone: true,
  template: `
    <div class="flex items-center justify-center py-16">
      <div class="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-rexel dark:border-neutral-700"></div>
    </div>
  `
})
export class SpinnerComponent {}
