import { Injectable, Inject, forwardRef } from '@angular/core';
import { Group } from '../models/group.model';
import { generateUUID, formatLogDate, formatLogTime } from '../../../utils/helpers';
import { EmployeeService } from '../../employee/services/employee.service';
import groupsData from '../../../data/groups.json';

@Injectable({
  providedIn: 'root'
})
export class GroupService {
  private groups: Group[] = [];
  private readonly storageKey = 'groups_data';

  constructor(
    @Inject(forwardRef(() => EmployeeService)) public employeeService: EmployeeService
  ) {
    this.loadGroups();
  }

  private loadGroups() {
    if (typeof window !== 'undefined' && window.localStorage) {
      const data = localStorage.getItem(this.storageKey);
      if (data) {
        try {
          this.groups = JSON.parse(data) as Group[];
          return;
        } catch (e) {
          console.error('Error parsing stored groups', e);
        }
      }
    }
    this.generateDefaultGroups();
    this.saveGroups();
  }

  public saveGroups() {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(this.storageKey, JSON.stringify(this.groups));
    }
  }

  private generateDefaultGroups() {
    this.groups = (groupsData as any[]).map(g => ({
      uuid: g.uuid || generateUUID(),
      name: g.name,
      status: g.status || 'Active',
      history: []
    }));
  }

  getGroups(): Group[] {
    return this.groups;
  }

  getGroupById(uuid: string): Group | undefined {
    return this.groups.find(g => g.uuid === uuid);
  }

  isGroupUsedByEmployee(groupName: string): boolean {
    return this.employeeService.getEmployees().some(e => e.group.name === groupName);
  }

  addAuditLog(group: Group, action: string) {
    if (!group.history) {
      group.history = [];
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
    group.history.push({
      date: dateStr,
      time: timeStr,
      name: user.toLowerCase(),
      action: action
    });
  }

  addGroup(group: Group) {
    group.history = [];
    this.addAuditLog(group, 'Insert');
    this.groups.unshift(group);
    this.saveGroups();
    this.employeeService.showToast(`Group ${group.name} berhasil disimpan.`, 'green');
  }

  updateGroup(group: Group, action: string = 'Update') {
    const idx = this.groups.findIndex(g => g.uuid === group.uuid);
    if (idx !== -1) {
      const oldGroup = this.groups[idx];
      
      if (oldGroup.status !== group.status && this.isGroupUsedByEmployee(oldGroup.name)) {
        this.employeeService.showToast(`Status Group ${oldGroup.name} tidak boleh diubah karena sedang digunakan oleh karyawan.`, 'red');
        return;
      }
      group.history = oldGroup.history || [];
      this.groups[idx] = group;
      this.addAuditLog(group, action);
      this.saveGroups();
      this.employeeService.showToast(`Group ${group.name} berhasil diperbarui.`, 'yellow');
    }
  }

  deleteGroup(uuid: string) {
    const idx = this.groups.findIndex(g => g.uuid === uuid);
    if (idx !== -1) {
      const group = this.groups[idx];
      if (this.isGroupUsedByEmployee(group.name)) {
        this.employeeService.showToast(`Group ${group.name} tidak boleh dihapus karena sedang digunakan oleh karyawan.`, 'red');
        return;
      }
      this.groups.splice(idx, 1);
      this.saveGroups();
      this.employeeService.showToast(`Group ${group.name} berhasil dihapus.`, 'red');
    }
  }
}
