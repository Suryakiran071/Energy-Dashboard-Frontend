import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, Router, RouterLinkActive, NavigationEnd } from '@angular/router';
import { AuthService } from './services/auth.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  menuOpen = false;
  showNav = true; // Controls visibility of the header and sidebar

  constructor(public authService: AuthService, private router: Router) {
    // Listen for route changes to hide nav on login/signup
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      const currentRoute = event.urlAfterRedirects;
      // Define paths where the navigation should be hidden
      const authRoutes = ['/login', '/signup'];
      // Hide nav if current route is login or signup, or if it's the root '/' and not logged in
      this.showNav = !authRoutes.includes(currentRoute) && currentRoute !== '/';
    });
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  getUserInitial(): string {
    const user = this.authService.getUser();
    return user && user.username ? user.username.charAt(0).toUpperCase() : 'U';
  }

  getUserName(): string {
    const user = this.authService.getUser();
    return user ? user.username : 'User';
  }

  isAdmin(): boolean {
      const user = this.authService.getUser();
      return user?.role === 'ROLE_ADMIN';
    }
}
