import { Component, OnInit, ElementRef, HostListener, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { EmployeeService } from '../services/employee.service';
import { GroupService } from '../../group/services/group.service';
import { Employee } from '../models/employee.model';
import { BreadcrumbComponent, BreadcrumbItem } from '../../shared/breadcrumb/breadcrumb.component';
import { HeaderComponent } from '../../shared/header/header.component';
import { ButtonComponent } from '../../shared/button/button.component';
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
  selector: 'app-employee-update',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, BreadcrumbComponent, HeaderComponent, ButtonComponent],
  templateUrl: './employee-update.component.html'
})
export class EmployeeUpdateComponent implements OnInit, AfterViewInit {
  updateForm!: FormGroup;
  submitted = false;
  idParam = '';
  employee!: Employee;

  groups: string[] = [];
  filteredGroups: string[] = [];
  groupSearch = '';
  showDropdown = false;
  selectedGroup = '';

  breadcrumbs: BreadcrumbItem[] = [
    { label: 'Administrator' },
    { label: 'Master' },
    { label: 'Employee', url: '/employees' },
    { label: 'Edit' }
  ];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
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

    this.route.params.subscribe(params => {
      this.idParam = params['id'] || '';
      const emp = this.employeeService.getEmployeeById(this.idParam);
      if (!emp) {
        this.router.navigate(['/employees']);
        return;
      }
      this.employee = emp;
      this.selectedGroup = emp.group.name;
      this.initForm(emp);
    });
  }

  initForm(emp: Employee) {
    
    const bDate = new Date(emp.birthDate);
    const bYYYY = bDate.getFullYear();
    const bMM = String(bDate.getMonth() + 1).padStart(2, '0');
    const bDD = String(bDate.getDate()).padStart(2, '0');
    const birthDateStr = `${bYYYY}-${bMM}-${bDD}`;

    const dDate = new Date(emp.description);
    const dYYYY = dDate.getFullYear();
    const dMM = String(dDate.getMonth() + 1).padStart(2, '0');
    const dDD = String(dDate.getDate()).padStart(2, '0');
    const dHH = String(dDate.getHours()).padStart(2, '0');
    const dMin = String(dDate.getMinutes()).padStart(2, '0');
    const joinDateTimeStr = `${dYYYY}-${dMM}-${dDD}T${dHH}:${dMin}`;

    this.updateForm = this.fb.group({
      username: [{ value: emp.username, disabled: true }, [Validators.required]], 
      firstName: [emp.firstName, [Validators.required]],
      lastName: [emp.lastName, [Validators.required]],
      email: [emp.email, [Validators.required, Validators.email]],
      birthDate: [birthDateStr, [Validators.required, maxDateTodayValidator]],
      basicSalary: [emp.basicSalary.toLocaleString('id-ID'), [Validators.required, Validators.pattern(/^[0-9.]+$/)]],
      status: [emp.status, [Validators.required]],
      group: [emp.group.name, [Validators.required]],
      description: [joinDateTimeStr, [Validators.required]]
    });
  }

  formatSalary(event: any) {
    const input = event.target as HTMLInputElement;
    let val = input.value.replace(/\D/g, '');
    if (val) {
      val = parseInt(val, 10).toLocaleString('id-ID');
    }
    input.value = val;
    this.updateForm.patchValue({ basicSalary: val }, { emitEvent: false });
  }

  ngAfterViewInit() {
    flatpickr('#birthDate', {
      dateFormat: 'Y-m-d',
      maxDate: 'today',
      onChange: (selectedDates, dateStr) => {
        this.updateForm.patchValue({ birthDate: dateStr });
      }
    });

    flatpickr('#description', {
      enableTime: true,
      dateFormat: 'Y-m-d H:i',
      time_24hr: true,
      onChange: (selectedDates, dateStr) => {
        this.updateForm.patchValue({ description: dateStr });
      }
    });
  }

  get f() { return this.updateForm.controls; }

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
    this.updateForm.patchValue({ group: group });
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

    if (this.updateForm.invalid) {
      return;
    }

    const val = this.updateForm.getRawValue(); 
    const updatedEmployee = {
      id: this.employee.id, 
      username: val.username,
      firstName: val.firstName,
      lastName: val.lastName,
      email: val.email,
      birthDate: new Date(val.birthDate),
      basicSalary: parseFloat(val.basicSalary.replace(/\./g, '')),
      status: val.status,
      group: (() => {
        const found = this.groupService.getGroups().find(g => g.name === val.group);
        return found ? { id: found.uuid, name: found.name } : { id: this.employee.group.id, name: val.group };
      })(),
      description: new Date(val.description)
    };

    this.employeeService.updateEmployee(updatedEmployee);
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
