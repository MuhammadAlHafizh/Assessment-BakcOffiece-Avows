import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { GroupService } from '../services/group.service';
import { BreadcrumbComponent, BreadcrumbItem } from '../../shared/breadcrumb/breadcrumb.component';
import { HeaderComponent } from '../../shared/header/header.component';
import { ButtonComponent } from '../../shared/button/button.component';
import { generateUUID } from '../../../utils/helpers';

@Component({
  selector: 'app-group-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, BreadcrumbComponent, HeaderComponent, ButtonComponent],
  templateUrl: './group-create.component.html'
})
export class GroupCreateComponent implements OnInit {
  addForm!: FormGroup;
  submitted = false;

  breadcrumbs: BreadcrumbItem[] = [
    { label: 'Administrator' },
    { label: 'Master' },
    { label: 'Group', url: '/groups' },
    { label: 'Create' }
  ];

  constructor(
    private fb: FormBuilder,
    private groupService: GroupService,
    private router: Router
  ) { }

  ngOnInit() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      this.router.navigate(['/login']);
      return;
    }

    this.addForm = this.fb.group({
      name: ['', [Validators.required]]
    });
  }

  get f() { return this.addForm.controls; }

  onSubmit() {
    this.submitted = true;

    if (this.addForm.invalid) {
      return;
    }

    const val = this.addForm.value;
    const newGroup = {
      uuid: generateUUID(),
      name: val.name,
      status: 'Active' as const
    };

    this.groupService.addGroup(newGroup);
    this.router.navigate(['/groups']);
  }

  onCancel() {
    this.router.navigate(['/groups']);
  }
}
