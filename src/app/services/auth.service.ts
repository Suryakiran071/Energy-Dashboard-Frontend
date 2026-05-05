import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private url = 'http://localhost:8090/api/auth';
  
  // Define shared options to keep the code clean
  private httpOptions = { withCredentials: true };

  constructor(private http: HttpClient, private router: Router) {}

  login(credentials: any) {
    // Standard login - receives the JSESSIONID cookie
    return this.http.post(`${this.url}/login`, credentials, this.httpOptions);
  }

  signup(user: any) {
    // Signup might not strictly need credentials depending on backend config,
    // but adding it ensures consistency if session tracking starts early.
    return this.http.post(`${this.url}/signup`, user, this.httpOptions);
  }

  setSession(user: any) {
    localStorage.setItem('currentUser', JSON.stringify(user));
  }

  getUser() {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
  }

  logout() {
    // Tell the backend to kill the session
    this.http.post(`${this.url}/logout`, {}, this.httpOptions)
      .subscribe({
        next: () => {
          this.clearLocalData();
        },
        error: () => {
          // Even if the server fails, we clear local data
          this.clearLocalData();
        }
      });
  }

  private clearLocalData() {
    localStorage.removeItem('currentUser');
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    const user = localStorage.getItem('currentUser');
    return !!user && user !== 'null' && user !== 'undefined';
  }

  getAllUsers() {
    // Required to send the cookie to access protected user list
    return this.http.get<any[]>(`http://localhost:8090/api/users`, this.httpOptions);
  }

  approveUser(userId: number, lineId: number) {
    // Required to send the cookie to perform administrative actions
    return this.http.put(
      `http://localhost:8090/api/users/${userId}/approve?lineId=${lineId}`, 
      {}, 
      this.httpOptions
    );
  }

  getLines(): Observable<any[]> {
    // Required to send the cookie to fetch lines
    return this.http.get<any[]>('http://localhost:8090/api/lines', this.httpOptions);
  }
}