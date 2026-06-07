import { Injectable } from '@angular/core';
import { Employee } from '../models/employee.model';
import { generateUUID, formatLogDate, formatLogTime } from '../../../utils/helpers';
import employeesData from '../../../data/employees.json';
import groupsData from '../../../data/groups.json';

export interface ToastMessage {
  id: number;
  text: string;
  type: 'yellow' | 'red' | 'green';
}

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private employees: Employee[] = [];
  private readonly storageKey = 'employees_data';

  public searchKeyword = '';
  public searchGroup = '';
  public page = 1;
  public pageSize = 25;
  public sortBy = 'username';
  public sortDesc = false;

  public activePopup: ToastMessage | null = null;
  private toastIdCounter = 0;

  constructor() {
    this.loadEmployees();
  }

  private loadEmployees() {
    if (typeof window !== 'undefined' && window.localStorage) {
      const data = localStorage.getItem(this.storageKey);
      if (data) {
        try {
          const parsed = JSON.parse(data) as any[];
          
          this.employees = parsed.map(emp => {
            let groupObj = emp.group;
            if (typeof emp.group === 'string') {
              const found = groupsData.find(g => g.name === emp.group);
              groupObj = found ? { id: found.uuid, name: found.name } : { id: 'unknown-id', name: emp.group as string };
            }
            return {
              ...emp,
              group: groupObj,
              birthDate: new Date(emp.birthDate),
              description: new Date(emp.description)
            };
          }) as Employee[];
          return;
        } catch (e) {
          console.error('Error parsing stored employees, generating mock...', e);
        }
      }
    }
    this.generateDummyData();
    this.saveEmployees();
  }

  public saveEmployees() {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(this.storageKey, JSON.stringify(this.employees));
    }
  }

  private generateDummyData() {
    this.employees = (employeesData as any[]).map(emp => {
      let groupObj = emp.group;
      if (typeof emp.group === 'string') {
        const found = groupsData.find(g => g.name === emp.group);
        groupObj = found ? { id: found.uuid, name: found.name } : { id: 'unknown-id', name: emp.group as string };
      }
      return {
        ...emp,
        group: groupObj,
        birthDate: new Date(emp.birthDate),
        description: new Date(emp.description)
      };
    });
  }

  getEmployees(): Employee[] {
    return this.employees;
  }

  getEmployeeByUsername(username: string): Employee | undefined {
    return this.employees.find(e => e.username === username);
  }

  getEmployeeById(id: string): Employee | undefined {
    return this.employees.find(e => e.id === id);
  }

  addAuditLog(employee: Employee, action: string) {
    if (!employee.history) {
      employee.history = [];
    }
    const now = new Date();
    const dateStr = formatLogDate(now);
    const timeStr = formatLogTime(now);
    const rawUser = localStorage.getItem('currentUser') || 'ivan choi';
    let user = 'ivan choi';
    try {
      if (rawUser.startsWith('{')) {
        const parsed = JSON.parse(rawUser);
        user = parsed.username || parsed.name || 'ivan choi';
      } else {
        user = rawUser;
      }
    } catch (e) {
      user = rawUser;
    }
    employee.history.push({
      date: dateStr,
      time: timeStr,
      name: user.toLowerCase(),
      action: action
    });
  }

  addEmployee(employee: Employee) {
    employee.history = [];
    this.addAuditLog(employee, 'Insert');
    this.employees.unshift(employee);
    this.saveEmployees();
    this.showToast(`Employee ${employee.firstName} ${employee.lastName} berhasil disimpan.`, 'green');
  }

  deleteEmployee(id: string) {
    const idx = this.employees.findIndex(e => e.id === id);
    if (idx !== -1) {
      const emp = this.employees[idx];
      this.employees.splice(idx, 1);
      this.saveEmployees();
      this.showToast(`Employee ${emp.firstName} ${emp.lastName} berhasil dihapus.`, 'red');
    }
  }

  updateEmployee(employee: Employee, action: string = 'Update') {
    const idx = this.employees.findIndex(e => e.id === employee.id);
    if (idx !== -1) {
      this.employees[idx] = employee;
      this.addAuditLog(employee, action);
      this.saveEmployees();

      const message = action === 'Change Status'
        ? `Status Employee ${employee.firstName} ${employee.lastName} berhasil diubah.`
        : `Info Employee ${employee.firstName} ${employee.lastName} berhasil diperbarui.`;

      const type = action === 'Change Status' ? 'green' : 'yellow';
      this.showToast(message, type);
    }
  }

  showToast(text: string, type: 'yellow' | 'red' | 'green') {
    this.activePopup = {
      id: ++this.toastIdCounter,
      text,
      type
    };
  }

  closePopup() {
    this.activePopup = null;
  }
}
