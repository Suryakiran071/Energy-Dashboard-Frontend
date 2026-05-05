import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private url = 'http://localhost:8090/api/auth';

  constructor(private http: HttpClient, private router: Router) {}


  login(credentials: any) {
    return this.http.post(`${this.url}/login`, credentials);
  }

  signup(user: any) {
    return this.http.post(`${this.url}/signup`, user);
  }

  // Save user object to browser memory
  setSession(user: any) {
    localStorage.setItem('currentUser', JSON.stringify(user));
  }

  // Get user details
  getUser() {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
  }


  logout() {
    localStorage.removeItem('currentUser');
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
  const user = localStorage.getItem('currentUser');
  // This covers null, undefined, and empty strings
  return !!user && user !== 'null' && user !== 'undefined';
}
getAllUsers() {
  return this.http.get<any[]>(`http://localhost:8090/api/users`);
}

approveUser(userId: number, lineId: number) {
  return this.http.put(`http://localhost:8090/api/users/${userId}/approve?lineId=${lineId}`, {});
}

declineUser(userId: number) {
  return this.http.delete(`http://localhost:8090/api/users/${userId}`);
}
getLines(): Observable<any[]> {
  // Ensure the port (8090) and path (/api/lines) match your working backend URL
  return this.http.get<any[]>('http://localhost:8090/api/lines');
}
}
