import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { EmployeeService } from '../services/employee.service';
import { Employee } from '../models/employee.model';
import { formatDate, formatDatetime, formatSalary } from '../../../utils/helpers';
import { BreadcrumbComponent, BreadcrumbItem } from '../../shared/breadcrumb/breadcrumb.component';
import { HeaderComponent } from '../../shared/header/header.component';
import { GroupService } from '../../group/services/group.service';

@Component({
  selector: 'app-employee-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, BreadcrumbComponent, HeaderComponent],
  templateUrl: './employee-detail.component.html'
})
export class EmployeeDetailComponent implements OnInit {
  employee: Employee | undefined;
  idParam = '';

  formatDate = formatDate;
  formatDatetime = formatDatetime;
  formatSalary = formatSalary;

  breadcrumbs: BreadcrumbItem[] = [
    { label: 'Administrator' },
    { label: 'Master' },
    { label: 'Employee', url: '/employees' },
    { label: 'Detail' }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private employeeService: EmployeeService,
    private groupService: GroupService
  ) { }

  ngOnInit() {
    
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      this.router.navigate(['/login']);
      return;
    }

    this.route.params.subscribe(params => {
      this.idParam = params['id'] || '';
      this.employee = this.employeeService.getEmployeeById(this.idParam);
    });
  }

  toggleEmployeeStatus(employee: Employee) {
    employee.status = employee.status === 'Active' ? 'Inactive' : 'Active';
    this.employeeService.updateEmployee(employee, 'Change Status');
  }

  goBack() {
    this.router.navigate(['/employees']);
  }

  viewGroupDetail(groupName: string) {
    const group = this.groupService.getGroups().find(g => g.name === groupName);
    if (group) {
      this.router.navigate(['/groups/detail', group.uuid]);
    }
  }
}
