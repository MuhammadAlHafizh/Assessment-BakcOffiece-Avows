import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PageSwitcherComponent } from '../page-switcher/page-switcher.component';

@Component({
  selector: 'app-page-info',
  standalone: true,
  imports: [CommonModule, FormsModule, PageSwitcherComponent],
  templateUrl: './page-info.component.html'
})
export class PageInfoComponent {
  
  @Input() page = 1;

  @Input() pageSize = 25;

  @Input() totalItems = 0;

  @Input() totalPages = 1;

  @Input() pagesArray: number[] = [];

  @Output() pageChange = new EventEmitter<number>();

  @Output() pageSizeChange = new EventEmitter<number>();

  get startEntry(): number {
    return this.totalItems === 0 ? 0 : (this.page - 1) * this.pageSize + 1;
  }

  get endEntry(): number {
    return Math.min(this.page * this.pageSize, this.totalItems);
  }

  onPageChange(newPage: number) {
    this.pageChange.emit(newPage);
  }

  onPageSizeChange(newSize: number) {
    this.pageSizeChange.emit(Number(newSize));
  }
}
