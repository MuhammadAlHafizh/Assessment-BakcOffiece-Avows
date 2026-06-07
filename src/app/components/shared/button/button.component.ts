import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button [type]="type" [disabled]="disabled" (click)="onClick($event)"
      [ngClass]="[
        'btn select-none focus:outline-none transition-all active:scale-95',
        variant === 'solid' ? 'btn-brand-solid' : 'btn-brand-outline',
        disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : '',
        customClass
      ]">
      <ng-content></ng-content>
      {{ text }}
    </button>
  `
})
export class ButtonComponent {
  @Input() text = '';
  @Input() type: 'button' | 'submit' = 'button';
  @Input() variant: 'solid' | 'outline' = 'solid';
  @Input() disabled = false;
  @Input() customClass = '';

  @Output() btnClick = new EventEmitter<MouseEvent>();

  onClick(event: MouseEvent) {
    if (this.type !== 'submit') {
      event.preventDefault();
    }
    if (!this.disabled) {
      this.btnClick.emit(event);
    }
  }
}
