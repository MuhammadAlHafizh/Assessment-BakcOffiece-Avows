import { Component, OnInit, ElementRef, HostListener, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { EmployeeService } from '../services/employee.service';
import { GroupService } from '../../group/services/group.service';
import { BreadcrumbComponent, BreadcrumbItem } from '../../shared/breadcrumb/breadcrumb.component';
import { HeaderComponent } from '../../shared/header/header.component';
import { ButtonComponent } from '../../shared/button/button.component';
import { generateUUID } from '../../../utils/helpers';
import flatpickr from 'flatpickr';

function maxDateTodayValidator(control: AbstractControl): { [key: string]: boolean } | null {
  if (!control.value) {
    return null;
  }
  const selectedDate = new Date(control.value);
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  return selectedDate > today ? { futureDate: true } : null;
}

@Component({
  selector: 'app-employee-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, BreadcrumbComponent, HeaderComponent, ButtonComponent],
  templateUrl: './employee-create.component.html'
})
export class EmployeeCreateComponent implements OnInit, AfterViewInit {
  addForm!: FormGroup;
  submitted = false;

  groups: string[] = [];
  filteredGroups: string[] = [];
  groupSearch = '';
  showDropdown = false;
  selectedGroup = '';

  breadcrumbs: BreadcrumbItem[] = [
    { label: 'Administrator' },
    { label: 'Master' },
    { label: 'Employee', url: '/employees' },
    { label: 'Create' }
  ];

  constructor(
    private fb: FormBuilder,
    public employeeService: EmployeeService,
    private groupService: GroupService,
    private router: Router,
    private eRef: ElementRef
  ) { }

  ngOnInit() {
    
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      this.router.navigate(['/login']);
      return;
    }

    this.groups = this.groupService.getGroups()
      .filter(g => g.status === 'Active')
      .map(g => g.name);
    this.filteredGroups = [...this.groups];

    this.addForm = this.fb.group({
      username: ['', [Validators.required]],
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      birthDate: ['', [Validators.required, maxDateTodayValidator]],
      basicSalary: ['', [Validators.required, Validators.pattern(/^[0-9.]+$/)]],
      status: ['Active', [Validators.required]],
      group: ['', [Validators.required]],
      description: ['', [Validators.required]] 
    });
  }

  formatSalary(event: any) {
    const input = event.target as HTMLInputElement;
    let val = input.value.replace(/\D/g, '');
    if (val) {
      val = parseInt(val, 10).toLocaleString('id-ID');
    }
    input.value = val;
    this.addForm.patchValue({ basicSalary: val }, { emitEvent: false });
  }

  ngAfterViewInit() {
    flatpickr('#birthDate', {
      enableTime: true,
      dateFormat: 'Y-m-d H:i',
      time_24hr: true,
      maxDate: 'today',
      onChange: (selectedDates, dateStr) => {
        this.addForm.patchValue({ birthDate: dateStr });
      }
    });

    flatpickr('#description', {
      enableTime: true,
      dateFormat: 'Y-m-d H:i',
      time_24hr: true,
      onChange: (selectedDates, dateStr) => {
        this.addForm.patchValue({ description: dateStr });
      }
    });
  }

  get f() { return this.addForm.controls; }

  toggleDropdown() {
    this.showDropdown = !this.showDropdown;
    if (this.showDropdown) {
      this.groupSearch = '';
      this.filterGroups();
    }
  }

  filterGroups() {
    this.filteredGroups = this.groups.filter(g =>
      g.toLowerCase().includes(this.groupSearch.toLowerCase())
    );
  }

  selectGroup(group: string) {
    this.selectedGroup = group;
    this.addForm.patchValue({ group: group });
    this.showDropdown = false;
  }

  @HostListener('document:click', ['$event'])
  clickout(event: MouseEvent) {
    if (!this.eRef.nativeElement.contains(event.target)) {
      this.showDropdown = false;
    }
  }

  onSubmit() {
    this.submitted = true;

    if (this.addForm.invalid) {
      return;
    }

    const val = this.addForm.value;
    const newEmployee = {
      id: generateUUID(),
      username: val.username,
      firstName: val.firstName,
      lastName: val.lastName,
      email: val.email,
      birthDate: new Date(val.birthDate),
      basicSalary: parseFloat(val.basicSalary.replace(/\./g, '')),
      status: val.status,
      group: (() => {
        const found = this.groupService.getGroups().find(g => g.name === val.group);
        return found ? { id: found.uuid, name: found.name } : { id: 'unknown-id', name: val.group };
      })(),
      description: new Date(val.description)
    };

    this.employeeService.addEmployee(newEmployee);
    this.router.navigate(['/employees']);
  }

  onCancel() {
    this.router.navigate(['/employees']);
  }

  getTodayString(): string {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mVal = today.getMonth() + 1;
    const dVal = today.getDate();
    const mm = mVal < 10 ? '0' + mVal : '' + mVal;
    const dd = dVal < 10 ? '0' + dVal : '' + dVal;
    return `${yyyy}-${mm}-${dd}`;
  }
}
