import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { EmployeeIndexComponent } from './employee-index.component';
import { EmployeeService } from '../services/employee.service';
import { Employee } from '../models/employee.model';
import { GroupService } from '../../group/services/group.service';

describe('EmployeeIndexComponent', () => {
  let component: EmployeeIndexComponent;
  let fixture: ComponentFixture<EmployeeIndexComponent>;
  let mockEmployeeService: jasmine.SpyObj<EmployeeService>;
  let mockGroupService: jasmine.SpyObj<GroupService>;
  let router: Router;

  const mockEmployees: Employee[] = [
    {
      id: 'uuid-1',
      username: 'johndoe',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@corporate.com',
      birthDate: new Date('1990-01-01'),
      basicSalary: 6000000,
      status: 'Active',
      group: { id: 'g1', name: 'Technology' },
      description: new Date(),
      history: []
    },
    {
      id: 'uuid-2',
      username: 'janedoe',
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane.doe@corporate.com',
      birthDate: new Date('1992-05-15'),
      basicSalary: 8000000,
      status: 'Inactive',
      group: { id: 'g2', name: 'Finance' },
      description: new Date(),
      history: []
    }
  ];

  beforeEach(async () => {
    mockEmployeeService = jasmine.createSpyObj('EmployeeService', ['getEmployees', 'deleteEmployee', 'updateEmployee']);
    mockEmployeeService.getEmployees.and.returnValue(mockEmployees);
    
    mockGroupService = jasmine.createSpyObj('GroupService', ['getGroups']);
    mockGroupService.getGroups.and.returnValue([{ uuid: 'g1', name: 'Technology', status: 'Active' }, { uuid: 'g2', name: 'Finance', status: 'Active' }]);

    mockEmployeeService.searchKeyword = '';
    mockEmployeeService.searchGroup = '';
    mockEmployeeService.page = 1;
    mockEmployeeService.sortBy = 'username';
    mockEmployeeService.sortDesc = false;

    spyOn(localStorage, 'getItem').and.callFake((key: string) => {
      if (key === 'isLoggedIn') return 'true';
      return null;
    });

    await TestBed.configureTestingModule({
      imports: [EmployeeIndexComponent],
      providers: [
        { provide: EmployeeService, useValue: mockEmployeeService },
        { provide: GroupService, useValue: mockGroupService },
        provideRouter([])
      ]
    }).compileComponents();

    router = TestBed.inject(Router);
    spyOn(router, 'navigate');

    fixture = TestBed.createComponent(EmployeeIndexComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and load initial employees', () => {
    expect(component).toBeTruthy();
    expect(component.employees.length).toBe(2);
    expect(mockEmployeeService.getEmployees).toHaveBeenCalled();
  });

  it('should search employees by name keyword', () => {
    component.statusFilter = ''; 
    component.searchKeyword = 'Jane';
    component.applyFiltersAndSort();

    expect(component.filteredEmployees.length).toBe(1);
    expect(component.filteredEmployees[0].username).toBe('janedoe');
  });

  it('should toggle single employee status and update via service', () => {
    const target = mockEmployees[0];
    const event = new MouseEvent('click');
    spyOn(event, 'stopPropagation');

    component.changeSingleStatus(target, 'Inactive', event);

    expect(target.status).toBe('Inactive');
    expect(mockEmployeeService.updateEmployee).toHaveBeenCalledWith(target, 'Change Status');
  });

  it('should filter by group selection', () => {
    component.statusFilter = ''; 
    component.searchGroup = 'Finance';
    component.applyFiltersAndSort();

    expect(component.filteredEmployees.length).toBe(1);
    expect(component.filteredEmployees[0].group.name).toBe('Finance');
  });
});
