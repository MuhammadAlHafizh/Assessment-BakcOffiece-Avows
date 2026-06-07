import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-delete-confirm-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './delete-confirm-modal.component.html'
})
export class DeleteConfirmModalComponent {
  
  @Input() show = false;

  @Input() itemName = '';

  @Output() confirmed = new EventEmitter<void>();

  @Output() cancelled = new EventEmitter<void>();

  konfirmasi() {
    this.confirmed.emit();
  }

  batal() {
    this.cancelled.emit();
  }
}
