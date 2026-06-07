import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { EmployeeIndexComponent } from './components/employee/index/employee-index.component';
import { EmployeeCreateComponent } from './components/employee/create/employee-create.component';
import { EmployeeDetailComponent } from './components/employee/detail/employee-detail.component';
import { EmployeeUpdateComponent } from './components/employee/update/employee-update.component';
import { EmployeeReportComponent } from './components/employee/report/employee-report.component';
import { GroupIndexComponent } from './components/group/index/group-index.component';
import { GroupCreateComponent } from './components/group/create/group-create.component';
import { GroupUpdateComponent } from './components/group/update/group-update.component';
import { GroupDetailComponent } from './components/group/detail/group-detail.component';
import { NotFoundComponent } from './components/errors/not-found/not-found.component';
import { ServerErrorComponent } from './components/errors/server-error/server-error.component';
import { authGuard, guestGuard } from './utils/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'login', component: LoginComponent, canActivate: [guestGuard] },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'employees', component: EmployeeIndexComponent, canActivate: [authGuard] },
  { path: 'employees/create', component: EmployeeCreateComponent, canActivate: [authGuard] },
  { path: 'employees/detail/:id', component: EmployeeDetailComponent, canActivate: [authGuard] },
  { path: 'employees/update/:id', component: EmployeeUpdateComponent, canActivate: [authGuard] },
  { path: 'employees/report', component: EmployeeReportComponent, canActivate: [authGuard] },
  { path: 'groups', component: GroupIndexComponent, canActivate: [authGuard] },
  { path: 'groups/create', component: GroupCreateComponent, canActivate: [authGuard] },
  { path: 'groups/detail/:id', component: GroupDetailComponent, canActivate: [authGuard] },
  { path: 'groups/update/:id', component: GroupUpdateComponent, canActivate: [authGuard] },
  { path: '404', component: NotFoundComponent },
  { path: '500', component: ServerErrorComponent },
  { path: '**', component: NotFoundComponent }
];
