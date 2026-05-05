import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './signup.component.html'
})
export class SignupComponent {
  passwordError: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  handleSignup(u: string, p: string) {
    this.passwordError = '';

    // Email format validation regex
    const emailPattern = /^[a-zA-Z0-0._%+-]+@[a-zA-Z0-0.-]+\.[a-zA-Z]{2,}$/;

    if (!u || !emailPattern.test(u)) {
      this.passwordError = 'Please enter a valid email address.';
      return;
    }
    
    // Password Validations
    if (p.length < 8) {
      this.passwordError = 'Password must be at least 8 characters.';
      return;
    }
    if (!/[A-Z]/.test(p) || !/[0-9]/.test(p) || !/[!@#$%^&*]/.test(p)) {
      this.passwordError = 'Password must include Uppercase, Number, and Symbol.';
      return;
    }

    const payload = { username: u, password: p };
    
    this.authService.signup(payload).subscribe({
      next: () => {
        alert('Signup Successful! Please wait for Admin approval.');
        this.router.navigate(['/login']);
      },
      error: (err: any) => {
        this.passwordError = err.error?.message || 'Account creation failed.';
      }
    });
  }
}