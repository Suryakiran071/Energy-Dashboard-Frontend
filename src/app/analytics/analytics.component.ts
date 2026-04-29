import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EnergyService } from '../services/energy.service';
import { AuthService } from '../services/auth.service';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.css']
})
export class AnalyticsComponent implements OnInit {
  currentUser: any;
  selectedDate: string = new Date().toISOString().split('T')[0];
  comparisonData: any[] = [];
  halfHourData: any[] = [];
  chart: any;

  constructor(
    private energyService: EnergyService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.currentUser = this.authService.getUser();
    this.loadAnalytics();
  }

  loadAnalytics() {
  const lineId = this.currentUser.role === 'ROLE_ADMIN' ? 1 : this.currentUser.assignedLine?.id;
  
  // 1. Existing Bar Chart Call
  if (this.currentUser.role === 'ROLE_ADMIN') {
    this.energyService.getLineComparison(this.selectedDate).subscribe((data: any) => {
      this.comparisonData = data;
      this.renderChart();
    });
  } else {
    this.energyService.getMeterComparison(lineId, this.selectedDate).subscribe((data: any) => {
      this.comparisonData = data;
      this.renderChart();
    });
  }

  // 2. NEW: Fetch raw readings to create the 30-min table
  this.energyService.getReadings(lineId, this.selectedDate).subscribe((readings: any[]) => {
    this.processHalfHourData(readings);
  });
}
  private processHalfHourData(readings: any[]) {
  const buckets: { [key: string]: number } = {};

  readings.forEach(r => {
    const time = new Date(r.ts);
    const hour = time.getHours();
    // Logic: 0-29 mins -> :00, 30-59 mins -> :30
    const minutes = time.getMinutes() < 30 ? '00' : '30';
    const label = `${hour.toString().padStart(2, '0')}:${minutes}`;

    buckets[label] = (buckets[label] || 0) + Number(r.kwh);
  });

  // Convert to sorted array for the HTML table
  this.halfHourData = Object.keys(buckets)
    .sort()
    .map(time => ({
      time: time,
      total: buckets[time].toFixed(2)
    }));
}

  renderChart() {
    const canvas = document.getElementById('analyticsChart') as HTMLCanvasElement;
    if (!canvas) return;
    if (this.chart) this.chart.destroy();

    this.chart = new Chart(canvas, {
      type: 'bar', // Professional bar chart for comparisons
      data: {
        labels: this.comparisonData.map(d => d.name),
        datasets: [
          {
            label: 'Total Consumption (kWh)',
            data: this.comparisonData.map(d => d.totalKwh),
            backgroundColor: '#818cf8', // Indigo
            borderRadius: 6
          },
          {
            label: 'Peak Demand (kWh)',
            data: this.comparisonData.map(d => d.peakKwh),
            backgroundColor: '#fbbf24', // Amber
            borderRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { labels: { color: '#9ca3af', font: { family: 'Inter' } } }
        },
        scales: {
          y: { 
            beginAtZero: true,
            grid: { color: 'rgba(75, 85, 99, 0.2)' },
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

  onDateChange(value: string) {
    this.selectedDate = value;
    this.loadAnalytics();
  }


}