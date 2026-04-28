import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './signup.component.html'
})
export class SignupComponent {
  constructor(private authService: AuthService, private router: Router) {}

  handleSignup(u: string, p: string) {
  const payload = { username: u, password: p };
  console.log("Sending to Backend:", payload); // Check this in F12 console

  this.authService.signup(payload).subscribe({
    next: () => {
      alert('Signup Successful! Please wait for Admin approval.');
      this.router.navigate(['/login']);
    },
    error: (err: any) => {
      console.error("Full Error Object:", err);
      alert('Signup failed: ' + err.status);
    }
  });
}
}