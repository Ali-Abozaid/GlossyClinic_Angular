import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable} from 'rxjs';
import { jwtDecode } from 'jwt-decode';
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:5275/api/Authenticatoin/login';

  constructor(private http: HttpClient) { }



  login(loginData: any): Observable<any> {
    return this.http.post(this.apiUrl, loginData);
  }

  saveToken(token: string) {
    localStorage.setItem('token', token);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  decodeToken(token: string): any {
    return jwtDecode(token);
  }
}
