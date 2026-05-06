import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { EnergyService } from '../services/energy.service';

@Component({
  selector: 'app-admin-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-management.component.html'
})
export class AdminManagementComponent implements OnInit {
  users: any[] = [];
  lines: any[] = [];
  
  showLineModal = false;
  showMeterModal = false;
  newLine = { name: '' };
  newMeter = { name: '', lineId: null as number | null };

  constructor(private authService: AuthService,
    private energyService: EnergyService
  ) {}

  ngOnInit() {
    this.loadUsers();
    this.loadLines(); 
  }

  loadLines() {
    this.authService.getLines().subscribe({
      next: (data) => this.lines = data,
      error: (err) => console.error('Could not fetch lines', err)
    });
  }

  loadUsers() {
    this.authService.getAllUsers().subscribe({
      next: (data:any) => this.users = data,
      error: (err:any) => console.error('Could not load users', err)
    });
  }


  saveLine() {
    if (!this.newLine.name) return;
    this.energyService.createLine(this.newLine).subscribe({
      next: () => {
        alert('Production Line created successfully!');
        this.newLine.name = '';
        this.showLineModal = false;
        this.loadLines();
      },
      error: (err) => alert('Failed to create line.')
    });
  }

  saveMeter() {
    if (!this.newMeter.name || !this.newMeter.lineId) {
      alert('Please provide a name and select a line.');
      return;
    }
    
    const payload = {
      name: this.newMeter.name,
      line: { id: this.newMeter.lineId } 
    };

    this.energyService.createMeter(payload).subscribe({
      next: () => {
        alert('IoT Meter provisioned successfully!');
        this.newMeter = { name: '', lineId: null };
        this.showMeterModal = false;
      },
      error: (err) => alert('Failed to create meter.')
    });
  }

  onDecline(userId: number) {
    if (!confirm('Decline and remove this user?')) return;
    this.authService.declineUser(userId).subscribe({
      next: () => {
        alert('User declined and removed.');
        this.loadUsers();
      },
      error: (err: any) => console.error(err)
    });
  }

  onApprove(userId: number, lineIdValue: string) {
    const lineId = parseInt(lineIdValue);
    this.authService.approveUser(userId, lineId).subscribe({
      next: (response: any) => {
        alert(`User approved and assigned to ${response.assignedLine?.name}!`);
        this.loadUsers();
      },
      error: (err: any) => alert('Approval failed.')
    });
  }
}