import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { EmployeeService } from '../services/employee.service';
import { Employee } from '../models/employee.model';
import { HeaderComponent } from '../../shared/header/header.component';
import { BreadcrumbComponent } from '../../shared/breadcrumb/breadcrumb.component';
import { BreadcrumbItem } from '../../shared/breadcrumb/breadcrumb.component';
import { ButtonComponent } from '../../shared/button/button.component';
import { GroupService } from '../../group/services/group.service';
import { createDataGenerator } from '../../../utils/data.helper';

@Component({
  selector: 'app-employee-report',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    HeaderComponent,
    BreadcrumbComponent,
    ButtonComponent
  ],
  templateUrl: './employee-report.component.html',
  styleUrls: ['./employee-report.component.css']
})
export class EmployeeReportComponent implements OnInit, OnDestroy {
  breadcrumbs: BreadcrumbItem[] = [
    { label: 'Administrator' },
    { label: 'Master' },
    { label: 'Employee', url: '/employees' },
    { label: 'Report' }
  ];

  filterKeyword = '';
  filterGroup = '';
  filterStatus = '';

  groups: string[] = [];

  isGenerating = false;
  isExporting = false;
  hasGenerated = false;
  totalData = 0;
  todayString = new Date().toISOString();

  previewData: Employee[] = [];
  private generator: AsyncGenerator<Employee[], void, unknown> | null = null;

  constructor(
    private employeeService: EmployeeService,
    private groupService: GroupService,
    private router: Router
  ) { }

  ngOnInit() {
    if (!localStorage.getItem('isLoggedIn')) {
      this.router.navigate(['/login']);
      return;
    }
    this.groups = this.groupService.getGroups().map(g => g.name);
  }

  ngOnDestroy() {
    this.generator = null;
  }

  private async fetchEmployeeBatch(page: number, size: number, filters: any): Promise<{ data: Employee[], total: number }> {
    
    await new Promise(resolve => setTimeout(resolve, 300));

    let allData = this.employeeService.getEmployees();

    if (filters.keyword) {
      const kw = filters.keyword.toLowerCase();
      allData = allData.filter(e =>
        e.firstName.toLowerCase().includes(kw) ||
        e.lastName.toLowerCase().includes(kw) ||
        e.username.toLowerCase().includes(kw) ||
        e.email.toLowerCase().includes(kw)
      );
    }
    if (filters.group) {
      allData = allData.filter(e => e.group.name === filters.group);
    }
    if (filters.status) {
      allData = allData.filter(e => e.status === filters.status);
    }

    const start = (page - 1) * size;
    const end = start + size;
    return {
      data: allData.slice(start, end),
      total: allData.length
    };
  }

  async generateReport() {
    this.isGenerating = true;
    this.previewData = [];
    this.hasGenerated = true;

    const filters = {
      keyword: this.filterKeyword,
      group: this.filterGroup,
      status: this.filterStatus
    };

    const reportData = createDataGenerator<Employee>(
      this.fetchEmployeeBatch.bind(this),
      filters,
      15
    );
    
    this.generator = reportData.generator;

    await this.loadNextBatch();

  }

  async loadNextBatch() {
    if (!this.generator) return;

    this.isGenerating = true;
    const result = await this.generator.next();

    if (!result.done && result.value) {
      this.previewData = [...this.previewData, ...result.value];
    }
    this.isGenerating = false;
  }

  resetReport() {
    this.filterKeyword = '';
    this.filterGroup = '';
    this.filterStatus = '';
    this.previewData = [];
    this.hasGenerated = false;
    this.generator = null;
  }

  printReport() {
    window.print();
  }

  async exportToExcel() {
    if (this.isExporting) return;
    this.isExporting = true;

    const filters = {
      keyword: this.filterKeyword,
      group: this.filterGroup,
      status: this.filterStatus
    };

    const exportGeneratorInfo = createDataGenerator<Employee>(
      this.fetchEmployeeBatch.bind(this),
      filters,
      30000
    );
    const exportGenerator = exportGeneratorInfo.generator;

    let allExportData: Employee[] = [];

    while (true) {
      const result = await exportGenerator.next();
      if (result.done) break;
      if (result.value) {
        allExportData = allExportData.concat(result.value);
      }
    }

    const header = ['Username', 'First Name', 'Last Name', 'Email', 'Group', 'Status', 'Basic Salary'];
    const rows = allExportData.map(e => [
      e.username,
      e.firstName,
      e.lastName,
      e.email,
      e.group.name,
      e.status,
      "Rp " + e.basicSalary.toLocaleString('id-ID')
    ]);

    const tsvContent = [
      header.join('\t'),
      ...rows.map(row => row.join('\t'))
    ].join('\n');

    const blob = new Blob([tsvContent], { type: 'application/vnd.ms-excel' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Report_Employee_${new Date().getTime()}.xls`;
    a.click();
    window.URL.revokeObjectURL(url);

    this.isExporting = false;
  }

  @HostListener('window:scroll', ['$event'])
  onScroll() {
    if (!this.hasGenerated || this.isGenerating || !this.generator) return;

    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 100) {
      this.loadNextBatch();
    }
  }
}
