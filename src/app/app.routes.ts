import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AnalyticsComponent } from './analytics/analytics.component';
import { ReportsComponent } from './reports/reports.component';
import { SettingsComponent } from './settings/settings.component';
import { AboutComponent } from './about/about.component';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { authGuard } from './guards/auth.guard'; // Import the guard
import { AdminManagementComponent } from './admin-management/admin-management.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },

  // Protected Routes
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'analytics', component: AnalyticsComponent, canActivate: [authGuard] },
  { path: 'reports', component: ReportsComponent, canActivate: [authGuard] },
  { path: 'settings', component: SettingsComponent, canActivate: [authGuard] },
  { path: 'about', component: AboutComponent, canActivate: [authGuard] },
  { 
  path: 'admin', 
  component: AdminManagementComponent, 
  canActivate: [authGuard],
  data: { expectedRole: 'ROLE_ADMIN' } // This matches the check in the guard
},

  // Redirects
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' }
];