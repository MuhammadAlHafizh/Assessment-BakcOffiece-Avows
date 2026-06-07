import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-page-switcher',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="flex items-center gap-1.5 select-none">
      <span class="text-xs font-medium text-slate-800 dark:text-slate-300">Page</span>
      <button class="pagination-btn" [disabled]="page === 1" (click)="changePage(page - 1)">
        <i class="fa fa-chevron-left text-xs"></i>
      </button>
      <select [ngModel]="page" (ngModelChange)="changePage($event)"
        class="pagination-btn !w-14 px-1 cursor-pointer text-xs" style="background: rgba(255,255,255,0.06);">
        <option *ngFor="let p of pagesArray" [value]="p" class="bg-white text-slate-800 dark:bg-slate-900 dark:text-white">{{ p }}</option>
      </select>
      <button class="pagination-btn" [disabled]="page === totalPages" (click)="changePage(page + 1)">
        <i class="fa fa-chevron-right text-xs"></i>
      </button>
    </div>
  `
})
export class PageSwitcherComponent {
  @Input() page = 1;
  @Input() totalPages = 1;
  @Input() pagesArray: number[] = [];

  @Output() pageChange = new EventEmitter<number>();

  changePage(newPage: number) {
    const parsed = Number(newPage);
    if (parsed >= 1 && parsed <= this.totalPages) {
      this.pageChange.emit(parsed);
    }
  }
}
