import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { EnergyService } from '../services/energy.service'; 
import { AuthService } from '../services/auth.service';
import Chart from 'chart.js/auto';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, HttpClientModule,FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  // Expose global Number function to the template
  protected readonly Number = Number;

  paginatedReadings: any[] = [];
  lines: any[] = [];
  meters: any[] = [];
  readings: any[] = [];
  filteredMeters: any[] = [];
  
  currentPage: number = 1;
  pageSize: number = 10;
  currentUser: any;
  isRestricted: boolean = false;
  selectedLine: number | null = null;
  selectedDate: string = new Date().toISOString().split('T')[0];
  selectedView: string | number = 'all';

  peakDemand: number | string = '—';
  avgConsumption: number | string = '—';
  thresholdLimit: number = 75;
  chart: any;

  constructor(
    public energyService: EnergyService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.currentUser = this.authService.getUser();

    this.energyService.currentThreshold.subscribe(val => {
      this.thresholdLimit = val;
      if (this.chart) this.renderChart();
    });

    if (this.currentUser && this.currentUser.role === 'ROLE_USER' && this.currentUser.assignedLine) {
      this.isRestricted = true;
      this.selectedLine = this.currentUser.assignedLine.id;
    }

    this.loadInitialData();
  }

  loadInitialData() {
    this.energyService.getLines().subscribe(lines => {
      this.lines = lines;
      if (!this.selectedLine && this.lines.length > 0) {
        this.selectedLine = this.lines[0].id;
      }
      this.energyService.getMeters().subscribe(meters => {
        this.meters = meters;
        this.updateDashboard();
      });
    });
  }

  updatePaginatedReadings() {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedReadings = this.readings.slice(startIndex, endIndex);
  }

  setPage(page: number) {
    this.currentPage = page;
    this.updatePaginatedReadings();
  }

  get totalPages(): number {
    return Math.ceil(this.readings.length / this.pageSize);
  }

  isOverThreshold(): boolean {
    const currentPeak = parseFloat(this.peakDemand.toString());
    const limit = Number(this.thresholdLimit);
    return !isNaN(currentPeak) && currentPeak > limit;
  }

  onFilterChange(type: 'line' | 'date', value: any) {
    if (type === 'line' && !this.isRestricted) this.selectedLine = Number(value);
    if (type === 'date') this.selectedDate = value;
    this.updateDashboard();
  }

  updateDashboard() {
    if (this.selectedLine === null) return;

    this.filteredMeters = this.meters.filter(m => 
      m.line && Number(m.line.id) === this.selectedLine
    );

    this.energyService.getReadings(this.selectedLine, this.selectedDate).subscribe((data: any[]) => {
      this.readings = data.map(r => ({
        ...r,
        ts: new Date(r.ts)
      }));

      this.currentPage = 1;
      this.updatePaginatedReadings();
      this.calculateStats();
      this.renderChart();
    });

    this.energyService.getPeakReading(this.selectedLine, this.selectedDate).subscribe((data: any) => {
      // We still update peakDemand via API for robustness, 
      // but calculateStats handles the UI value.
    });
  }

  getKwhForMeter(meterId: number): string {
    const reading = this.readings.find(r => {
      const idToCompare = r.meter?.id || r.meter_id; 
      return Number(idToCompare) === Number(meterId);
    });
    return reading ? reading.kwh : '—';
  }

  private calculateStats() {
    if (this.readings.length > 0) {
      const total = this.readings.reduce((acc: number, curr: any) => acc + Number(curr.kwh), 0);
      this.avgConsumption = (total / this.readings.length).toFixed(2);
      const kwhValues = this.readings.map(r => Number(r.kwh));
      this.peakDemand = Math.max(...kwhValues).toFixed(2);
    } else {
      this.avgConsumption = '—';
      this.peakDemand = '—';
    }
  }

  onViewChange() {
    this.renderChart(); // Re-draw the chart based on the new selection
  }

  renderChart() {
  const canvas = document.getElementById('demandChart') as HTMLCanvasElement;
  if (!canvas || this.readings.length === 0) return;
  if (this.chart) this.chart.destroy();

  // 1. Filter data based on view
  let displayReadings = this.readings;
  if (this.selectedView !== 'all') {
    displayReadings = this.readings.filter(r => 
      Number(r.meter?.id || r.meter_id) === Number(this.selectedView)
    );
  }

  // 2. Group data by time
  const groupedData = displayReadings.reduce((acc: any, curr: any) => {
    const timeKey = curr.ts.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    if (!acc[timeKey]) acc[timeKey] = 0;
    acc[timeKey] += Number(curr.kwh);
    return acc;
  }, {});

  const sortedLabels = Object.keys(groupedData).sort((a, b) => {
    return new Date('1970/01/01 ' + a).getTime() - new Date('1970/01/01 ' + b).getTime();
  });

  const finalValues = sortedLabels.map(label => groupedData[label]);
  const thresholdLineData = sortedLabels.map(() => Number(this.thresholdLimit));
  const chartLabel = this.selectedView === 'all' ? 'Total Line Load' : 'Meter Consumption';

  this.chart = new Chart(canvas, {
    type: 'line',
    data: {
      labels: sortedLabels,
      datasets: [
        {
          label: `${chartLabel} (kWh)`,
          data: finalValues,
          borderColor: this.selectedView === 'all' ? '#6366f1' : '#10b981',
          backgroundColor: this.selectedView === 'all' ? 'rgba(99, 102, 241, 0.1)' : 'rgba(16, 185, 129, 0.1)',
          fill: true,
          tension: 0.4,
          borderWidth: 3,
          pointBackgroundColor: finalValues.map(v => v >= this.thresholdLimit ? '#ef4444' : '#6366f1'),
          pointRadius: finalValues.map(v => (v >= this.thresholdLimit ? 8 : 4)), // Changed 0 to 4
          pointHoverRadius: 10,
          order: 1 
        },
        {
          label: 'Safety Threshold',
          data: thresholdLineData,
          borderColor: '#ef4444',
          borderWidth: 1,
          borderDash: [6, 25],
          fill: false,
          pointRadius: 0,
          pointHoverRadius: 0,
          order: 2
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        intersect: false,
        mode: 'index',
      },
      plugins: {
        legend: {
          display: true,
          labels: { color: '#9ca3af', font: { size: 10, weight: 'bold' }, usePointStyle: true }
        },
        tooltip: {
          backgroundColor: '#111827',
          padding: 12,
          callbacks: {
            label: (context) => {
              // FIX: Use a fallback for val to satisfy TypeScript
              const val = context.parsed.y ?? 0; 
              if (context.datasetIndex === 0 && val >= this.thresholdLimit) {
                return `LOAD CRITICAL: ${val} kWh`;
              }
              return `${context.dataset.label}: ${val} kWh`;
            }
          }
        }
      },
      scales: {
        y: { 
          beginAtZero: true, 
          grid: { color: 'rgba(255, 255, 255, 0.05)' }, 
          ticks: { color: '#9ca3af' }
        },
        x: { 
          grid: { display: false }, 
          ticks: { color: '#9ca3af' } 
        }
      }
    }
  });
}
}