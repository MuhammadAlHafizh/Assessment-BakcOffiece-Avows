import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { GroupService } from '../services/group.service';
import { Group } from '../models/group.model';
import { BreadcrumbComponent, BreadcrumbItem } from '../../shared/breadcrumb/breadcrumb.component';
import { HeaderComponent } from '../../shared/header/header.component';

@Component({
  selector: 'app-group-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, BreadcrumbComponent, HeaderComponent],
  templateUrl: './group-detail.component.html'
})
export class GroupDetailComponent implements OnInit {
  group: Group | undefined;
  uuidParam = '';

  breadcrumbs: BreadcrumbItem[] = [
    { label: 'Administrator' },
    { label: 'Master' },
    { label: 'Group', url: '/groups' },
    { label: 'Detail' }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public groupService: GroupService
  ) { }

  ngOnInit() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      this.router.navigate(['/login']);
      return;
    }

    this.route.params.subscribe(params => {
      this.uuidParam = params['id'] || '';
      this.group = this.groupService.getGroupById(this.uuidParam);
    });
  }

  toggleGroupStatus(group: Group) {
    const nextStatus: 'Active' | 'Inactive' = group.status === 'Active' ? 'Inactive' : 'Active';
    const updated = { ...group, status: nextStatus };
    this.groupService.updateGroup(updated, 'Change Status');
    this.group = this.groupService.getGroupById(this.uuidParam);
  }

  goBack() {
    this.router.navigate(['/groups']);
  }
}
