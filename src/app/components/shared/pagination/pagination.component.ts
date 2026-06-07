import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pagination.component.html'
})
export class PaginationComponent {
  
  @Input() page: number = 1;
  @Input() pageSize: number = 10;
  @Input() totalPages: number = 1;
  @Input() pagesArray: number[] = [];
  @Input() totalItems: number = 0;
  @Input() displayStartIndex: number = 0;
  @Input() displayEndIndex: number = 0;
  @Input() pageSizeOptions: number[] = [5, 10, 20, 50, 100];

  @Output() pageChange = new EventEmitter<number>();
  @Output() pageSizeChange = new EventEmitter<number>();

  onPageClick(newPage: number) {
    if (newPage >= 1 && newPage <= this.totalPages) {
      this.pageChange.emit(newPage);
    }
  }

  onSizeSelect(newSize: number) {
    this.pageSizeChange.emit(newSize);
  }
}
