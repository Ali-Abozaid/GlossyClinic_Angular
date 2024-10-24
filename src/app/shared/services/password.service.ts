import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PasswordService {
  private apiUrl = 'http://localhost:5275/api/Authentication/change-Branch-password';

  constructor(private http: HttpClient) {}

  emailExists(email: string): Observable<boolean> {
    const url = `${this.apiUrl}${email}`;
    return this.http.get<boolean>(url).pipe(
      catchError(() => of(false)) 
    );
  }

  changePassword(email: string, newPassword: string, confirmPassword: string): Observable<any> {
    
  
    const body = {
      email,
      newPassword,
      confirmPassword,
      

    };
  
    return this.http.post(this.apiUrl , body);
  }
  sendResetCode(email: string): Observable<any> {
    const body = { email };
    return this.http.post(`http://localhost:5275/api/Authentication/ForgotPassword`, body);
  }
  verifyResetCode(email: string, code: string): Observable<any> {
    const body = { email, code };
    return this.http.post<any>('http://localhost:5275/api/Authentication/VerifyResetCode', body);
  }
}
