import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-management',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-management.component.html'
})
export class AdminManagementComponent implements OnInit {
  users: any[] = [];
  lines: any[] = []; // Store the lines from the DB here

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.loadUsers();
    this.loadLines(); // Load lines on startup
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

  onDecline(userId: number) {
    if (!confirm('Decline and remove this user?')) return;
    this.authService.declineUser(userId).subscribe({
      next: () => {
        alert('User declined and removed.');
        this.loadUsers();
      },
      error: (err: any) => {
        alert('Could not decline user.');
        console.error(err);
      }
    });
  }

  onApprove(userId: number, lineIdValue: string) {
  const lineId = parseInt(lineIdValue); // Convert the dropdown string value to a number
  
  this.authService.approveUser(userId, lineId).subscribe({
    next: (response: any) => {
      alert(`User approved and assigned to ${response.assignedLine.name}!`);
      this.loadUsers(); // Refresh the table list
    },
    error: (err: any) => {
      alert('Approval failed. Make sure the Line ID exists in the database.');
      console.error(err);
    }
  });
}

}