import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GroupService } from '../services/group.service';
import { Group } from '../models/group.model';
import { HeaderComponent } from '../../shared/header/header.component';
import { BreadcrumbComponent, BreadcrumbItem } from '../../shared/breadcrumb/breadcrumb.component';
import { ButtonComponent } from '../../shared/button/button.component';
import { PaginationHelper } from '../../../utils/data.helper';
import { PageSwitcherComponent } from '../../shared/page-switcher/page-switcher.component';
import { HistoryModalComponent } from '../../shared/history-modal/history-modal.component';
import { DeleteConfirmModalComponent } from '../../shared/delete-confirm-modal/delete-confirm-modal.component';
import { PageInfoComponent } from '../../shared/page-info/page-info.component';
import { Subject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-group-index',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    HeaderComponent,
    BreadcrumbComponent,
    ButtonComponent,
    PageSwitcherComponent,
    HistoryModalComponent,
    DeleteConfirmModalComponent,
    PageInfoComponent
  ],
  templateUrl: './group-index.component.html'
})
export class GroupIndexComponent implements OnInit, OnDestroy {
  private searchSubject = new Subject<void>();
  private searchSubscription!: Subscription;

  groups: Group[] = [];
  filteredGroups: Group[] = [];
  paginatedGroups: Group[] = [];

  breadcrumbs: BreadcrumbItem[] = [
    { label: 'Administrator' },
    { label: 'Master' },
    { label: 'Group', url: '/groups' },
    { label: 'List' }
  ];

  searchKeyword = '';
  statusFilter = '';
  filterName = ''; 

  page = 1;
  pageSize = 25;
  totalPages = 1;
  pagesArray: number[] = [];

  sortBy = 'name';
  sortDesc = false;

  isLoading = false;

  groupToDelete: Group | null = null;
  showDeleteConfirmModal = false;

  selectedGroups: { [uuid: string]: boolean } = {};
  masterSelected = false;
  bulkStatusTarget = 'Active';
  activeStatusDropdownId: string | null = null;

  showHistoryModal = false;
  activeHistoryGroup: Group | null = null;

  constructor(
    public groupService: GroupService,
    public router: Router
  ) { }

  ngOnInit() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      this.router.navigate(['/login']);
      return;
    }

    this.searchSubscription = this.searchSubject.pipe(
      debounceTime(400)
    ).subscribe(() => {
      this.applyFiltersAndSort();
      this.triggerLoadingSpinner();
    });

    this.groups = this.groupService.getGroups();
    this.applyFiltersAndSort();
    this.triggerLoadingSpinner();
  }

  ngOnDestroy() {
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
  }

  triggerLoadingSpinner() {
    this.isLoading = true;
    setTimeout(() => {
      this.isLoading = false;
    }, 600);
  }

  onSearchChange() {
    this.page = 1;
    this.searchSubject.next();
  }

  onFilterClickChange() {
    this.page = 1;
    this.applyFiltersAndSort();
    this.triggerLoadingSpinner();
  }

  onSort(column: string) {
    if (this.sortBy === column) {
      this.sortDesc = !this.sortDesc;
    } else {
      this.sortBy = column;
      this.sortDesc = false;
    }
    this.applyFiltersAndSort();
    this.triggerLoadingSpinner();
  }

  onPageChange(newPage: number) {
    if (newPage >= 1 && newPage <= this.totalPages) {
      this.page = newPage;
      this.updatePagination();
      this.triggerLoadingSpinner();
    }
  }

  onPageSizeChange(newPageSize: number) {
    this.pageSize = newPageSize;
    this.page = 1;
    this.applyFiltersAndSort();
    this.triggerLoadingSpinner();
  }

  applyFiltersAndSort() {
    this.filteredGroups = this.groups.filter(g => {
      const keywordMatch = !this.searchKeyword ||
        g.name.toLowerCase().includes(this.searchKeyword.toLowerCase());

      const nameMatch = !this.filterName ||
        g.name.toLowerCase().includes(this.filterName.toLowerCase());

      const statusMatch = !this.statusFilter || g.status === this.statusFilter;

      return keywordMatch && nameMatch && statusMatch;
    });

    this.filteredGroups.sort((a, b) => {
      let valA = (a[this.sortBy as keyof Group] ?? '').toString().toLowerCase();
      let valB = (b[this.sortBy as keyof Group] ?? '').toString().toLowerCase();

      if (valA < valB) return this.sortDesc ? 1 : -1;
      if (valA > valB) return this.sortDesc ? -1 : 1;
      return 0;
    });

    this.updatePagination();
  }

  updatePagination() {
    const res = PaginationHelper.paginate(this.filteredGroups, this.page, this.pageSize);
    this.paginatedGroups = res.paginatedItems;
    this.totalPages = res.totalPages;
    this.pagesArray = res.pagesArray;
  }

  onEdit(group: Group, event: MouseEvent) {
    event.stopPropagation();
    this.router.navigate(['/groups/update', group.uuid]);
  }

  viewDetail(group: Group) {
    this.router.navigate(['/groups/detail', group.uuid]);
  }

  onDelete(group: Group, event: MouseEvent) {
    event.stopPropagation();
    this.groupToDelete = group;
    this.showDeleteConfirmModal = true;
  }

  confirmDelete() {
    if (this.groupToDelete) {
      this.groupService.deleteGroup(this.groupToDelete.uuid);
      this.groups = this.groupService.getGroups();
      this.applyFiltersAndSort();
      this.closeDeleteConfirmModal();
    }
  }

  closeDeleteConfirmModal() {
    this.groupToDelete = null;
    this.showDeleteConfirmModal = false;
  }

  toggleSelectAll() {
    this.masterSelected = !this.masterSelected;
    this.paginatedGroups.forEach(g => {
      this.selectedGroups[g.uuid] = this.masterSelected;
    });
  }

  onGroupSelectChange() {
    if (this.paginatedGroups.length === 0) {
      this.masterSelected = false;
      return;
    }
    this.masterSelected = this.paginatedGroups.every(g => this.selectedGroups[g.uuid]);
  }

  toggleStatusDropdown(uuid: string, event: MouseEvent) {
    event.stopPropagation();
    if (this.activeStatusDropdownId === uuid) {
      this.activeStatusDropdownId = null;
    } else {
      this.activeStatusDropdownId = uuid;
    }
  }

  changeSingleStatus(group: Group, newStatus: 'Active' | 'Inactive', event: MouseEvent) {
    event.stopPropagation();
    const updatedGroup = { ...group, status: newStatus };
    this.groupService.updateGroup(updatedGroup, 'Change Status');
    this.groups = this.groupService.getGroups();
    this.activeStatusDropdownId = null;
    this.applyFiltersAndSort();
  }

  @HostListener('document:click')
  onDocumentClick() {
    this.activeStatusDropdownId = null;
  }

  applyBulkStatusChange() {
    const selectedUuids = Object.keys(this.selectedGroups).filter(uuid => this.selectedGroups[uuid]);
    if (selectedUuids.length === 0) {
      alert('Select at least one group to change status.');
      return;
    }

    let skippedNames: string[] = [];

    selectedUuids.forEach(uuid => {
      const group = this.groups.find(g => g.uuid === uuid);
      if (group) {
        if (group.status !== this.bulkStatusTarget) {
          if (this.groupService.isGroupUsedByEmployee(group.name)) {
            skippedNames.push(group.name);
          } else {
            const updatedGroup = { ...group, status: this.bulkStatusTarget as 'Active' | 'Inactive' };
            this.groupService.updateGroup(updatedGroup, 'Change Status');
          }
        }
      }
    });

    if (skippedNames.length > 0) {
      this.groupService.employeeService.showToast(
        `Grup (${skippedNames.join(', ')}) tidak boleh diubah status karena sedang digunakan oleh karyawan.`,
        'red'
      );
    }

    this.selectedGroups = {};
    this.masterSelected = false;
    this.bulkStatusTarget = 'Active';
    this.groups = this.groupService.getGroups();
    this.applyFiltersAndSort();
    this.triggerLoadingSpinner();
  }

  resetFilters() {
    this.searchKeyword = '';
    this.statusFilter = '';
    this.filterName = '';
    this.page = 1;
    this.selectedGroups = {};
    this.masterSelected = false;
    this.bulkStatusTarget = 'Active';
    this.applyFiltersAndSort();
    this.triggerLoadingSpinner();
  }

  showHistory(group: Group, event: MouseEvent) {
    event.stopPropagation();
    this.activeHistoryGroup = group;
    this.showHistoryModal = true;
  }

  closeHistoryModal() {
    this.activeHistoryGroup = null;
    this.showHistoryModal = false;
  }
}
