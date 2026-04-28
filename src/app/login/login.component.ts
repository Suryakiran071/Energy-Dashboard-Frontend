import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './login.component.html'
})
export class LoginComponent {
  constructor(private authService: AuthService, private router: Router) {}

  handleLogin(u: string, p: string) {
    this.authService.login({ username: u, password: p }).subscribe({
      next: (user: any) => {
        this.authService.setSession(user);
        this.router.navigate(['/dashboard']);
      },
      error: (err:any) => alert('Login Failed: ' + (err.error || 'Invalid credentials'))
    });
  }
}