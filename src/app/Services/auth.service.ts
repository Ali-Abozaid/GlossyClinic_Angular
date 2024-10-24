import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, tap, throwError } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:5275/api/Authentication';

  constructor(private http: HttpClient) { }

  register(userData: any): Observable<any> {
    console.log('Sending registration data:', userData);
    return this.http.post(`${this.apiUrl}/register`, userData).pipe(
      catchError(error => {
        // Log the error here if needed
        console.error('Error in AuthService:', error);
        return throwError(() => error);
      })
    );
  }
}
