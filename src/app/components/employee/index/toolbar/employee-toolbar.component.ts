import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { ButtonComponent } from '../../../shared/button/button.component';
import { PageSwitcherComponent } from '../../../shared/page-switcher/page-switcher.component';

@Component({
  selector: 'app-employee-toolbar',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ButtonComponent, PageSwitcherComponent],
  templateUrl: './employee-toolbar.component.html'
})
export class EmployeeToolbarComponent {
  @Input() statusFilter = 'Active';
  @Input() searchGroup = '';
  @Input() bulkStatusTarget = 'Active';
  @Input() page = 1;
  @Input() totalPages = 1;
  @Input() pagesArray: number[] = [];
  @Input() groups: string[] = [];
  @Input() pageSize = 25;

  @Output() statusFilterChange = new EventEmitter<string>();
  @Output() searchGroupChange = new EventEmitter<string>();
  @Output() bulkStatusTargetChange = new EventEmitter<string>();
  @Output() reset = new EventEmitter<void>();
  @Output() applyBulkStatus = new EventEmitter<void>();
  @Output() pageChange = new EventEmitter<number>();
  @Output() pageSizeChange = new EventEmitter<number>();

  constructor(public router: Router) {}

  onStatusFilterChange(value: string) {
    this.statusFilterChange.emit(value);
  }

  onSearchGroupChange(value: string) {
    this.searchGroupChange.emit(value);
  }

  onBulkStatusTargetChange(value: string) {
    this.bulkStatusTargetChange.emit(value);
  }

  onReset() {
    this.reset.emit();
  }

  onApplyBulkStatus() {
    this.applyBulkStatus.emit();
  }

  onPageChange(newPage: number) {
    this.pageChange.emit(newPage);
  }

  onPageSizeChange(value: string) {
    this.pageSizeChange.emit(parseInt(value, 10));
  }
}
