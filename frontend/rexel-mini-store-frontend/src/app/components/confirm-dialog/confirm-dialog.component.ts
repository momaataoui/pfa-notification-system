import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  template: `
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40" (click)="cancel.emit()">
      <div class="w-90 max-w-[90vw] rounded-lg bg-white p-6 dark:border dark:border-neutral-800 dark:bg-neutral-950" (click)="$event.stopPropagation()">
        <h2 class="mb-2 text-lg font-semibold text-anthracite dark:text-white">{{ title }}</h2>
        <p class="mb-6 text-sm text-gray-500 dark:text-neutral-400">{{ message }}</p>
        <div class="flex justify-end gap-3">
          <button
            type="button"
            (click)="cancel.emit()"
            class="rounded-md border border-gray-300 px-4 py-2 text-sm text-anthracite hover:bg-gray-50 dark:border-neutral-700 dark:text-white dark:hover:bg-neutral-800">
            Annuler
          </button>
          <button
            type="button"
            (click)="confirm.emit()"
            class="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700">
            Confirmer
          </button>
        </div>
      </div>
    </div>
  `
})
export class ConfirmDialogComponent {
  @Input() title = 'Confirmer';
  @Input() message = 'Etes-vous sur ?';
  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
}
