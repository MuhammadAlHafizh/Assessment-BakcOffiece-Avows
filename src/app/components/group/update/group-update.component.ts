import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { GroupService } from '../services/group.service';
import { Group } from '../models/group.model';
import { BreadcrumbComponent, BreadcrumbItem } from '../../shared/breadcrumb/breadcrumb.component';
import { HeaderComponent } from '../../shared/header/header.component';
import { ButtonComponent } from '../../shared/button/button.component';

@Component({
  selector: 'app-group-update',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, BreadcrumbComponent, HeaderComponent, ButtonComponent],
  templateUrl: './group-update.component.html'
})
export class GroupUpdateComponent implements OnInit {
  editForm!: FormGroup;
  submitted = false;
  uuidParam = '';
  group: Group | undefined;

  breadcrumbs: BreadcrumbItem[] = [
    { label: 'Administrator' },
    { label: 'Master' },
    { label: 'Group', url: '/groups' },
    { label: 'Update' }
  ];

  constructor(
    private fb: FormBuilder,
    private groupService: GroupService,
    private route: ActivatedRoute,
    private router: Router
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

      if (!this.group) {
        this.router.navigate(['/groups']);
        return;
      }

      this.editForm = this.fb.group({
        name: [this.group.name, [Validators.required]],
        status: [this.group.status, [Validators.required]]
      });
    });
  }

  get f() { return this.editForm.controls; }

  onSubmit() {
    this.submitted = true;

    if (this.editForm.invalid || !this.group) {
      return;
    }

    const val = this.editForm.value;
    const updatedGroup: Group = {
      uuid: this.group.uuid,
      name: val.name,
      status: val.status
    };

    this.groupService.updateGroup(updatedGroup);
    this.router.navigate(['/groups']);
  }

  onCancel() {
    this.router.navigate(['/groups']);
  }
}
