import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms'; // Step 2: Import FormsModule and NgForm

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule], // Add FormsModule here
  templateUrl: './signup.component.html'
})
export class SignupComponent {
  passwordError: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  handleSignup(form: NgForm) {
    if (form.invalid) return;

    const userData = form.value; 
    const p = userData.password;
    this.passwordError = '';

    if (!/[A-Z]/.test(p) || !/[0-9]/.test(p) || !/[!@#$%^&*]/.test(p)) {
      this.passwordError = 'Include an Uppercase letter, Number, and Symbol.';
      return;
    }

    this.authService.signup(userData).subscribe({
      next: () => {
        alert('Signup Successful! Your profile is pending Admin approval.');
        this.router.navigate(['/login']);
      },
      error: (err: any) => {
        this.passwordError = err.error?.message || 'Registration failed. ID or Email might be in use.';
      }
    });
  }
}