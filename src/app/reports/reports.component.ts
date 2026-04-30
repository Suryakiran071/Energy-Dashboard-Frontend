import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EnergyService } from '../services/energy.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reports.component.html'
})
export class ReportsComponent implements OnInit {
  currentUser: any;
  isRestricted: boolean = false;
  lines: any[] = [];
  selectedLine: number | null = null;
  selectedDate: string = new Date().toISOString().split('T')[0];
  
  reportData: any = null;
  isLoading: boolean = false;

  constructor(
    private energyService: EnergyService,
    private authService: AuthService // Inject AuthService
  ) {}

  ngOnInit() {
    this.currentUser = this.authService.getUser();

    // Check permissions
    if (this.currentUser && this.currentUser.role === 'ROLE_USER' && this.currentUser.assignedLine) {
      this.isRestricted = true;
      this.selectedLine = this.currentUser.assignedLine.id;
    }

    this.energyService.getLines().subscribe(data => {
      this.lines = data;
      // If Admin, default to first line. If Restricted, the value is already set.
      if (!this.selectedLine && this.lines.length > 0) {
        this.selectedLine = this.lines[0].id;
      }
    });
  }

  generateReport() {
    if (!this.selectedLine) return;
    this.isLoading = true;
    
    this.energyService.getReadings(this.selectedLine, this.selectedDate).subscribe(readings => {
      if (readings.length > 0) {
        const kwhValues = readings.map((r: any) => Number(r.kwh));
        this.reportData = {
          totalConsumption: kwhValues.reduce((a:number, b:number) => a + b, 0).toFixed(2),
          peakValue: Math.max(...kwhValues).toFixed(2),
          avgValue: (kwhValues.reduce((a:number, b:number) => a + b, 0) / readings.length).toFixed(2),
          readingCount: readings.length,
          generatedAt: new Date()
        };
      } else {
        this.reportData = 'empty';
      }
      this.isLoading = false;
    });
  }

  printReport() {
    window.print();
  }
}