import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { EmployeeService } from '../services/employee.service';
import { Employee } from '../models/employee.model';
import { HeaderComponent } from '../../shared/header/header.component';
import { BreadcrumbComponent, BreadcrumbItem } from '../../shared/breadcrumb/breadcrumb.component';
import { EmployeeToolbarComponent } from './toolbar/employee-toolbar.component';
import { ButtonComponent } from '../../shared/button/button.component';
import { PaginationHelper } from '../../../utils/data.helper';
import { GroupService } from '../../group/services/group.service';
import { HistoryModalComponent } from '../../shared/history-modal/history-modal.component';
import { DeleteConfirmModalComponent } from '../../shared/delete-confirm-modal/delete-confirm-modal.component';
import { PageInfoComponent } from '../../shared/page-info/page-info.component';

@Component({
  selector: 'app-employee-index',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    HeaderComponent,
    BreadcrumbComponent,
    EmployeeToolbarComponent,
    ButtonComponent,
    HistoryModalComponent,
    DeleteConfirmModalComponent,
    PageInfoComponent
  ],
  templateUrl: './employee-index.component.html'
})
export class EmployeeIndexComponent implements OnInit, OnDestroy {
  private searchSubject = new Subject<void>();
  private searchSubscription!: Subscription;

  employees: Employee[] = [];
  filteredEmployees: Employee[] = [];
  paginatedEmployees: Employee[] = [];

  breadcrumbs: BreadcrumbItem[] = [
    { label: 'Administrator' },
    { label: 'Master' },
    { label: 'Employee', url: '/employees' },
    { label: 'List' }
  ];

  searchKeyword = '';
  searchGroup = '';
  statusFilter = 'Active'; 

  filterName = '';
  filterEmail = '';
  filterGroup = '';

  page = 1;
  pageSize = 25;
  totalPages = 1;
  pagesArray: number[] = [];

  sortBy = 'username';
  sortDesc = false;

  isLoading = false;

  selectedEmployees: { [username: string]: boolean } = {};
  masterSelected = false;
  bulkStatusTarget = 'Active';

  constructor(
    public employeeService: EmployeeService,
    private groupService: GroupService,
    private router: Router
  ) { }

  get groups(): string[] {
    return this.groupService.getGroups().map(g => g.name);
  }

  ngOnInit() {
    
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      this.router.navigate(['/login']);
      return;
    }

    this.searchKeyword = this.employeeService.searchKeyword;
    this.searchGroup = this.employeeService.searchGroup;
    this.statusFilter = this.employeeService.statusFilter;
    this.page = this.employeeService.page;
    this.pageSize = this.employeeService.pageSize;

    this.sortBy = this.employeeService.sortBy;
    this.sortDesc = this.employeeService.sortDesc;

    this.searchSubscription = this.searchSubject.pipe(
      debounceTime(400)
    ).subscribe(() => {
      this.applyFiltersAndSort();
      this.triggerLoadingSpinner();
    });

    this.employees = this.employeeService.getEmployees();
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
    this.saveStateToService();
    this.searchSubject.next();
  }

  onFilterClickChange() {
    this.page = 1;
    this.saveStateToService();
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
    this.saveStateToService();
    this.applyFiltersAndSort();
    this.triggerLoadingSpinner();
  }

  onPageChange(newPage: number) {
    if (newPage >= 1 && newPage <= this.totalPages) {
      this.page = newPage;
      this.saveStateToService();
      this.updatePagination();
      this.triggerLoadingSpinner();
    }
  }

  onPageSizeChange(newPageSize: number) {
    this.pageSize = newPageSize;
    this.page = 1; 
    this.saveStateToService();
    this.applyFiltersAndSort();
    this.triggerLoadingSpinner();
  }

  saveStateToService() {
    this.employeeService.searchKeyword = this.searchKeyword;
    this.employeeService.searchGroup = this.searchGroup;
    this.employeeService.statusFilter = this.statusFilter;
    this.employeeService.page = this.page;
    this.employeeService.pageSize = this.pageSize;

    this.employeeService.sortBy = this.sortBy;
    this.employeeService.sortDesc = this.sortDesc;
  }

  applyFiltersAndSort() {
    
    this.filteredEmployees = this.employees.filter(emp => {
      
      const keywordMatch = !this.searchKeyword ||
        emp.username.toLowerCase().includes(this.searchKeyword.toLowerCase()) ||
        emp.firstName.toLowerCase().includes(this.searchKeyword.toLowerCase()) ||
        emp.lastName.toLowerCase().includes(this.searchKeyword.toLowerCase()) ||
        emp.email.toLowerCase().includes(this.searchKeyword.toLowerCase());

      const nameMatch = !this.filterName ||
        `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(this.filterName.toLowerCase()) ||
        emp.username.toLowerCase().includes(this.filterName.toLowerCase());

      const emailMatch = !this.filterEmail ||
        emp.email.toLowerCase().includes(this.filterEmail.toLowerCase());

      const groupMatch = !this.filterGroup ||
        emp.group.name.toLowerCase().includes(this.filterGroup.toLowerCase());

      const groupToolbarMatch = !this.searchGroup || emp.group.name === this.searchGroup;
      const statusToolbarMatch = !this.statusFilter || emp.status === this.statusFilter;

      return keywordMatch && nameMatch && emailMatch && groupMatch && groupToolbarMatch && statusToolbarMatch;
    });

    this.filteredEmployees.sort((a, b) => {
      let valA: any = this.sortBy === 'group' ? a.group.name : a[this.sortBy as keyof Employee] ?? '';
      let valB: any = this.sortBy === 'group' ? b.group.name : b[this.sortBy as keyof Employee] ?? '';

      if (valA instanceof Date) {
        valA = valA.getTime();
      }
      if (valB instanceof Date) {
        valB = valB.getTime();
      }

      if (typeof valA === 'string') {
        valA = valA.toLowerCase();
      }
      if (typeof valB === 'string') {
        valB = valB.toLowerCase();
      }

      if (valA < valB) return this.sortDesc ? 1 : -1;
      if (valA > valB) return this.sortDesc ? -1 : 1;
      return 0;
    });

    this.updatePagination();
  }

  updatePagination() {
    const res = PaginationHelper.paginate(this.filteredEmployees, this.page, this.pageSize);
    this.paginatedEmployees = res.paginatedItems;
    this.totalPages = res.totalPages;
    this.pagesArray = res.pagesArray;
    this.saveStateToService();
  }

  onEdit(employee: Employee, event: MouseEvent) {
    event.stopPropagation();
    this.router.navigate(['/employees/update', employee.id]);
  }

  employeeToDelete: Employee | null = null;
  showDeleteConfirmModal = false;

  onDelete(employee: Employee, event: MouseEvent) {
    event.stopPropagation();
    this.employeeToDelete = employee;
    this.showDeleteConfirmModal = true;
  }

  confirmDelete() {
    if (this.employeeToDelete) {
      this.employeeService.deleteEmployee(this.employeeToDelete.id);
      
      this.employees = this.employeeService.getEmployees();
      this.applyFiltersAndSort();
      this.closeDeleteConfirmModal();
    }
  }

  closeDeleteConfirmModal() {
    this.employeeToDelete = null;
    this.showDeleteConfirmModal = false;
  }

  viewDetail(employee: Employee) {
    this.router.navigate(['/employees/detail', employee.id]);
  }

  viewGroupDetail(groupName: string, event: MouseEvent) {
    event.stopPropagation();
    const group = this.groupService.getGroups().find(g => g.name === groupName);
    if (group) {
      this.router.navigate(['/groups/detail', group.uuid]);
    }
  }

  activeHistoryEmployee: any = null;
  showHistoryModal = false;

  showHistory(employee: Employee, event: MouseEvent) {
    event.stopPropagation();
    this.activeHistoryEmployee = employee;
    this.showHistoryModal = true;
  }

  closeHistoryModal() {
    this.activeHistoryEmployee = null;
    this.showHistoryModal = false;
  }

  activeStatusDropdownId: string | null = null;

  toggleStatusDropdown(employeeId: string, event: MouseEvent) {
    event.stopPropagation();
    if (this.activeStatusDropdownId === employeeId) {
      this.activeStatusDropdownId = null;
    } else {
      this.activeStatusDropdownId = employeeId;
    }
  }

  changeSingleStatus(employee: Employee, newStatus: string, event: MouseEvent) {
    event.stopPropagation();
    employee.status = newStatus;
    this.employeeService.updateEmployee(employee, 'Change Status');
    this.activeStatusDropdownId = null;
    this.applyFiltersAndSort();
  }

  @HostListener('document:click')
  onDocumentClick() {
    this.activeStatusDropdownId = null;
  }

  toggleSelectAll() {
    this.masterSelected = !this.masterSelected;
    this.paginatedEmployees.forEach(emp => {
      this.selectedEmployees[emp.username] = this.masterSelected;
    });
  }

  onEmployeeSelectChange() {
    if (this.paginatedEmployees.length === 0) {
      this.masterSelected = false;
      return;
    }
    this.masterSelected = this.paginatedEmployees.every(emp => this.selectedEmployees[emp.username]);
  }

  applyBulkStatusChange() {
    const selectedUsernames = Object.keys(this.selectedEmployees).filter(uname => this.selectedEmployees[uname]);
    if (selectedUsernames.length === 0) {
      alert('Select at least one employee to change status.');
      return;
    }
    selectedUsernames.forEach(uname => {
      const emp = this.employees.find(e => e.username === uname);
      if (emp) {
        emp.status = this.bulkStatusTarget;
        this.employeeService.updateEmployee(emp, 'Change Status');
      }
    });
    
    this.selectedEmployees = {};
    this.masterSelected = false;
    this.bulkStatusTarget = 'Active'; 
    this.applyFiltersAndSort();
    this.triggerLoadingSpinner();
  }

  resetFilters() {
    this.searchKeyword = '';
    this.searchGroup = '';
    this.statusFilter = 'Active';
    this.page = 1;
    this.saveStateToService();
    this.applyFiltersAndSort();
    this.triggerLoadingSpinner();
  }

  logout() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('currentUser');
    this.router.navigate(['/login']);
  }
}
