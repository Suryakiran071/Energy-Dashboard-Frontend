import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { EnergyService } from '../services/energy.service'; 
import { AuthService } from '../services/auth.service';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  lines: any[] = [];
  meters: any[] = [];
  readings: any[] = [];
  filteredMeters: any[] = [];
  
  currentUser: any;
  isRestricted: boolean = false;
  selectedLine: number | null = null;
  selectedDate: string = new Date().toISOString().split('T')[0];

  peakDemand: number | string = '—';
  avgConsumption: number | string = '—';
  chart: any;

  // Single constructor injecting both services
  constructor(
    public energyService: EnergyService,
    private authService: AuthService
  ) {}

  ngOnInit() {
  this.currentUser = this.authService.getUser();

  // 1. Lock the line immediately if they are an operator
  if (this.currentUser && this.currentUser.role === 'ROLE_USER' && this.currentUser.assignedLine) {
    this.isRestricted = true;
    this.selectedLine = this.currentUser.assignedLine.id;
  }

  // 2. Fetch everything
  this.loadInitialData();
}

  loadInitialData() {
  // Fetch Lines and Meters in parallel (or nested) to ensure we have names
  this.energyService.getLines().subscribe(lines => {
    this.lines = lines;
    // Only auto-select the first line if the user isn't already locked to one
    if (!this.selectedLine && this.lines.length > 0) {
      this.selectedLine = this.lines[0].id;
    }

    this.energyService.getMeters().subscribe(meters => {
      this.meters = meters;
      this.updateDashboard(); // Run the first update
    });
  });
}

  loadMetersAndSync() {
    this.energyService.getMeters().subscribe((data: any) => {
      this.meters = data;
      this.updateDashboard(); 
    });
  }

  onFilterChange(type: 'line' | 'date', value: any) {
  console.log(`Filter changed: ${type} = ${value}`); // Debug log
  
  if (type === 'line' && !this.isRestricted) {
    this.selectedLine = Number(value);
  }
  
  if (type === 'date') {
    this.selectedDate = value; // This must be in YYYY-MM-DD format
  }

  // CRITICAL: This must be called to fetch new data for the new date!
  this.updateDashboard();
}

  updateDashboard() {
    if (this.selectedLine === null) return;

    // Filter meters based on selected line
    this.filteredMeters = this.meters.filter(m => 
      m.line && Number(m.line.id) === this.selectedLine
    );

    // Fetch data
    this.energyService.getReadings(this.selectedLine, this.selectedDate).subscribe((data: any) => {
      this.readings = data;
      this.calculateStats();
      this.renderChart();
    });

    this.energyService.getPeakReading(this.selectedLine, this.selectedDate).subscribe((data: any) => {
      this.peakDemand = data?.kwh || '—';
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
    // 1. Calculate Average (as we discussed)
    const total = this.readings.reduce((acc: number, curr: any) => acc + Number(curr.kwh), 0);
    this.avgConsumption = (total / this.readings.length).toFixed(2);

    // 2. Calculate Peak Demand (Finding the highest single reading)
    // We use Math.max to find the largest 'kwh' value in the array
    const kwhValues = this.readings.map(r => Number(r.kwh));
    const maxKwh = Math.max(...kwhValues);
    
    this.peakDemand = maxKwh.toFixed(2); // This will show 58.20 for Line A
  } else {
    this.avgConsumption = '—';
    this.peakDemand = '—';
  }
}

  private renderChart() {
  const canvas = document.getElementById('demandChart') as HTMLCanvasElement;
  if (!canvas || this.readings.length === 0) return;
  if (this.chart) this.chart.destroy();

  // 1. GROUP AND SUM: Combine all meters by their timestamp
  const groupedData = this.readings.reduce((acc: any, curr: any) => {
    // We create a unique key based on the time (e.g., "10:30 AM")
    const timeKey = new Date(curr.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    if (!acc[timeKey]) {
      acc[timeKey] = 0;
    }
    acc[timeKey] += Number(curr.kwh); // Sum the kWh for all meters at this time
    return acc;
  }, {});

  // 2. SORT: Ensure the times are in order (8am -> 12pm -> 6pm)
  const sortedLabels = Object.keys(groupedData).sort((a, b) => {
    return new Date('1970/01/01 ' + a).getTime() - new Date('1970/01/01 ' + b).getTime();
  });
  const finalValues = sortedLabels.map(label => groupedData[label]);

  // 3. RENDER: Create a clean, single-line chart
  this.chart = new Chart(canvas, {
    type: 'line',
    data: {
      labels: sortedLabels,
      datasets: [{
        label: 'Total Line Load (kWh)',
        data: finalValues,
        borderColor: '#6366f1', // Sleek Indigo
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        fill: true,
        tension: 0.4, // Smooth "S-curve" instead of jagged lines
        pointRadius: 4,
        pointBackgroundColor: '#6366f1',
        borderWidth: 3
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false } // Hide legend for a cleaner look
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