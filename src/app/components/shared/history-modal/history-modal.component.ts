import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface HistoryEntry {
  date: string;
  time: string;
  name: string;
  action: string;
}

@Component({
  selector: 'app-history-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './history-modal.component.html'
})
export class HistoryModalComponent {

  @Input() title = 'Trail';

  @Input() history: HistoryEntry[] | null | undefined = [];

  @Input() show = false;

  @Output() closed = new EventEmitter<void>();

  tutupModal() {
    this.closed.emit();
  }
}
