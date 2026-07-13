import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export type ToastType = 'success' | 'error';

export interface ToastMessage {
  text: string;
  type: ToastType;
}

@Injectable({ providedIn: 'root' })
export class ToastService {

  private readonly messageSubject = new Subject<ToastMessage>();
  readonly message$ = this.messageSubject.asObservable();

  success(text: string): void {
    this.messageSubject.next({ text, type: 'success' });
  }

  error(text: string): void {
    this.messageSubject.next({ text, type: 'error' });
  }

  show(text: string): void {
    this.success(text);
  }
}
