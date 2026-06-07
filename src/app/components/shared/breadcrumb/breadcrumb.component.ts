import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

export interface BreadcrumbItem {
  label: string;
  url?: string;
}

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './breadcrumb.component.html',
  styles: [`
    .breadcrumb-nav {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      margin-bottom: 0;
      color: var(--text-secondary);
    }
    .breadcrumb-item {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .breadcrumb-item a {
      color: var(--primary-color);
      font-weight: 500;
      transition: color 0.2s ease;
    }
    .breadcrumb-item a:hover {
      color: var(--primary-hover);
    }
    .breadcrumb-separator {
      color: var(--text-secondary);
      opacity: 0.5;
    }
    .breadcrumb-active {
      color: var(--text-color);
      font-weight: 600;
    }
  `]
})
export class BreadcrumbComponent {
  
  @Input() items: BreadcrumbItem[] = [];
}
