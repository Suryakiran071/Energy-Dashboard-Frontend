import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { EnergyService } from '../services/energy.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
  currentUser: any;
  
  // UI States
  thresholdLimit: number = 100;
  refreshInterval: string = '15';
  darkMode: boolean = true;
  notificationsEnabled: boolean = true;

  constructor(
  public authService: AuthService, 
  public energyService: EnergyService // Add this line!
) {}

  ngOnInit() {
    this.currentUser = this.authService.getUser();
  }

  saveSettings() {
  this.energyService.updateThreshold(this.thresholdLimit);
  alert('System Threshold Updated to ' + this.thresholdLimit + ' kWh');
}

  getUserInitial(): string {
    return this.currentUser?.username?.charAt(0).toUpperCase() || 'U';
  }
}