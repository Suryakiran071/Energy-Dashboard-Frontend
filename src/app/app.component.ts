import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { AuthService } from './services/auth.service'; // Import your service

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink,CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {
  menuOpen = false; 
  constructor(public authService: AuthService) {}

  toggleMenu() {   
    this.menuOpen = !this.menuOpen;
  }
}