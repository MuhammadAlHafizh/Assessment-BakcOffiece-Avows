import {
  Component, OnInit, AfterViewInit, OnDestroy,
  ViewChild, ElementRef, NgZone
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { EmployeeService } from '../employee/services/employee.service';
import { Employee } from '../employee/models/employee.model';
import { HeaderComponent } from '../shared/header/header.component';
import { BreadcrumbComponent, BreadcrumbItem } from '../shared/breadcrumb/breadcrumb.component';
import { GroupService } from '../group/services/group.service';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent, BreadcrumbComponent],
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('barCanvas') barCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('donutCanvas') donutCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('statusCanvas') statusCanvas!: ElementRef<HTMLCanvasElement>;

  private barChart: Chart | null = null;
  private donutChart: Chart | null = null;
  private statusChart: Chart | null = null;

  employees: Employee[] = [];

  breadcrumbs: BreadcrumbItem[] = [
    { label: 'Administrator' },
    { label: 'Dashboard' }
  ];

  totalKaryawan = 0;
  totalAktif = 0;
  totalNonAktif = 0;
  totalGrup = 0;

  grupLabel: string[] = [];
  grupJumlah: number[] = [];

  logTerbaru: { date: string; time: string; name: string; action: string; namaKaryawan: string }[] = [];

  private warnaGrup = [
    '#3b82f6', '#8b5cf6', '#ec4899', '#f97316',
    '#10b981', '#06b6d4', '#f59e0b', '#ef4444',
    '#84cc16', '#6366f1'
  ];

  constructor(
    private employeeService: EmployeeService,
    private groupService: GroupService,
    private router: Router,
    private ngZone: NgZone
  ) { }

  ngOnInit() {
    if (!localStorage.getItem('isLoggedIn')) {
      this.router.navigate(['/login']);
      return;
    }

    this.employees = this.employeeService.getEmployees();
    this.hitungStatistik();
    this.siapkanLogAktivitas();
  }

  ngAfterViewInit() {
    this.ngZone.runOutsideAngular(() => {
      setTimeout(() => {
        this.buatBarChart();
        this.buatDonutChart();
        this.buatStatusChart();
      }, 50);
    });
  }

  ngOnDestroy() {
    this.barChart?.destroy();
    this.donutChart?.destroy();
    this.statusChart?.destroy();
  }

  hitungStatistik() {
    this.totalKaryawan = this.employees.length;
    this.totalAktif = this.employees.filter(e => e.status === 'Active').length;
    this.totalNonAktif = this.employees.filter(e => e.status === 'Inactive').length;

    const masterGroups = this.groupService.getGroups();
    this.totalGrup = masterGroups.length;

    const mapGrup = new Map<string, number>();
    masterGroups.forEach(g => {
      mapGrup.set(g.name, 0);
    });

    this.employees.forEach(e => {
      if (mapGrup.has(e.group.name)) {
        mapGrup.set(e.group.name, mapGrup.get(e.group.name)! + 1);
      } else {
        mapGrup.set(e.group.name, (mapGrup.get(e.group.name) || 0) + 1);
      }
    });

    const terurut = [...mapGrup.entries()].sort((a, b) => b[1] - a[1]);
    this.grupLabel = terurut.map(([label]) => label);
    this.grupJumlah = terurut.map(([, jml]) => jml);
  }

  siapkanLogAktivitas() {
    const semua: typeof this.logTerbaru = [];

    this.employees.forEach(emp => {
      (emp.history || []).forEach(log => {
        semua.push({
          ...log,
          namaKaryawan: `${emp.firstName} ${emp.lastName}`
        });
      });
    });

    const groups = this.groupService.getGroups();
    groups.forEach(g => {
      (g.history || []).forEach(log => {
        semua.push({
          ...log,
          namaKaryawan: `Group: ${g.name}`
        });
      });
    });

    this.logTerbaru = semua
      .sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time))
      .slice(0, 8);
  }

  buatBarChart() {
    const canvas = this.barCanvas?.nativeElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    this.barChart?.destroy();

    const gradien = ctx.createLinearGradient(0, 0, 0, 260);
    gradien.addColorStop(0, 'rgba(59, 130, 246, 0.95)');
    gradien.addColorStop(1, 'rgba(139, 92, 246, 0.65)');

    const config: ChartConfiguration<'bar'> = {
      type: 'bar',
      data: {
        labels: this.grupLabel,
        datasets: [{
          label: 'Karyawan',
          data: this.grupJumlah,
          backgroundColor: gradien,
          borderWidth: 0,
          borderRadius: 6,
          borderSkipped: false,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 600 },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(15,23,42,0.95)',
            titleColor: '#94a3b8',
            bodyColor: '#f8fafc',
            borderColor: 'rgba(255,255,255,0.1)',
            borderWidth: 1,
            padding: 10,
            callbacks: {
              label: (item) => ` ${item.parsed.y} karyawan`
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: '#64748b', font: { size: 11 } },
            border: { display: false }
          },
          y: {
            beginAtZero: true,
            grid: { color: 'rgba(255,255,255,0.04)' },
            ticks: { color: '#64748b', font: { size: 11 }, stepSize: 1 },
            border: { display: false }
          }
        }
      }
    };

    this.barChart = new Chart(ctx, config);
  }

  buatDonutChart() {
    const canvas = this.donutCanvas?.nativeElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    this.donutChart?.destroy();

    const config: ChartConfiguration<'doughnut'> = {
      type: 'doughnut',
      data: {
        labels: this.grupLabel,
        datasets: [{
          data: this.grupJumlah,
          backgroundColor: this.warnaGrup,
          borderColor: 'rgba(15,23,42,0.4)',
          borderWidth: 2,
          hoverOffset: 10,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '68%',
        animation: { duration: 600 },
        plugins: {
          legend: {
            position: 'right',
            labels: {
              color: '#94a3b8',
              font: { size: 11 },
              boxWidth: 10,
              padding: 10,
              usePointStyle: true,
              pointStyle: 'circle'
            }
          },
          tooltip: {
            backgroundColor: 'rgba(15,23,42,0.95)',
            titleColor: '#94a3b8',
            bodyColor: '#f8fafc',
            borderColor: 'rgba(255,255,255,0.1)',
            borderWidth: 1,
            padding: 10,
            callbacks: {
              label: (item) => {
                const total = (item.dataset.data as number[]).reduce((a, b) => a + b, 0);
                const pct = total > 0 ? Math.round((item.parsed / total) * 100) : 0;
                return ` ${item.label}: ${item.parsed} orang (${pct}%)`;
              }
            }
          }
        }
      }
    };

    this.donutChart = new Chart(ctx, config);
  }

  buatStatusChart() {
    const canvas = this.statusCanvas?.nativeElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    this.statusChart?.destroy();

    const config: ChartConfiguration<'doughnut'> = {
      type: 'doughnut',
      data: {
        labels: ['Aktif', 'Non-Aktif'],
        datasets: [{
          data: [this.totalAktif, this.totalNonAktif],
          backgroundColor: ['#10b981', '#f43f5e'],
          borderColor: 'rgba(15,23,42,0.4)',
          borderWidth: 2,
          hoverOffset: 8,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '72%',
        animation: { duration: 600 },
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: '#94a3b8',
              font: { size: 11 },
              boxWidth: 10,
              usePointStyle: true,
              pointStyle: 'circle',
              padding: 14
            }
          },
          tooltip: {
            backgroundColor: 'rgba(15,23,42,0.95)',
            titleColor: '#94a3b8',
            bodyColor: '#f8fafc',
            borderColor: 'rgba(255,255,255,0.1)',
            borderWidth: 1,
            padding: 10,
            callbacks: {
              label: (item) => {
                const pct = this.totalKaryawan > 0
                  ? Math.round((item.parsed / this.totalKaryawan) * 100) : 0;
                return ` ${item.parsed} orang (${pct}%)`;
              }
            }
          }
        }
      }
    };

    this.statusChart = new Chart(ctx, config);
  }

  warnaBadge(action: string): string {
    if (action === 'Insert') return 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
    if (action === 'Update') return 'bg-blue-500/20 text-blue-400 border border-blue-500/30';
    if (action === 'Change Status') return 'bg-amber-500/20 text-amber-400 border border-amber-500/30';
    return 'bg-slate-500/20 text-slate-400 border border-slate-500/30';
  }

  goToEmployees(status: string) {
    this.employeeService.statusFilter = status;
    this.employeeService.page = 1;
    this.employeeService.searchKeyword = '';
    this.employeeService.searchGroup = '';
    this.router.navigate(['/employees']);
  }

  goToGroups() {
    this.router.navigate(['/groups']);
  }
}
