import { TestBed } from '@angular/core/testing';
import { EmployeeService } from './employee.service';
import { Employee } from '../models/employee.model';

describe('EmployeeService', () => {
  let service: EmployeeService;

  beforeEach(() => {
    
    let store: { [key: string]: string } = {};
    spyOn(localStorage, 'getItem').and.callFake((key: string) => store[key] || null);
    spyOn(localStorage, 'setItem').and.callFake((key: string, value: string) => {
      store[key] = value;
    });
    spyOn(localStorage, 'removeItem').and.callFake((key: string) => {
      delete store[key];
    });

    TestBed.configureTestingModule({});
    service = TestBed.inject(EmployeeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should load mock employees', () => {
    const employees = service.getEmployees();
    expect(employees.length).toBeGreaterThan(0);
  });

  it('should add employee and show green popup', () => {
    const mockEmp: Employee = {
      id: 'test-uuid-123',
      username: 'testuser',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@test.com',
      birthDate: new Date('1990-01-01'),
      basicSalary: 5000000,
      status: 'Active',
      group: { id: 'g1', name: 'Technology' },
      description: new Date(),
      history: []
    };

    service.addEmployee(mockEmp);

    const employees = service.getEmployees();
    expect(employees[0].id).toBe('test-uuid-123');
    expect(service.activePopup).toBeTruthy();
    expect(service.activePopup?.type).toBe('green');
    expect(service.activePopup?.text).toContain('John Doe berhasil disimpan');
  });

  it('should delete employee and show green popup', () => {
    const employees = service.getEmployees();
    const beforeCount = employees.length;
    const target = employees[0];

    service.deleteEmployee(target.id);

    const afterEmployees = service.getEmployees();
    expect(afterEmployees.length).toBe(beforeCount - 1);
    expect(service.activePopup?.type).toBe('red');
    expect(service.activePopup?.text).toContain('berhasil dihapus');
  });

  it('should update employee status and show green popup', () => {
    const employees = service.getEmployees();
    const target = { ...employees[0] };
    target.status = 'Inactive';

    service.updateEmployee(target, 'Change Status');

    const updated = service.getEmployeeById(target.id);
    expect(updated?.status).toBe('Inactive');
    expect(service.activePopup?.type).toBe('green');
    expect(service.activePopup?.text).toContain('Status Employee');
    expect(service.activePopup?.text).toContain('berhasil diubah');
  });
});
