import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import {  Router } from '@angular/router';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  userDataToken: any;
  private email: string = '';
   role:string='';

  constructor(private _HttpClient: HttpClient, private _Router: Router) {}

  // Save the user data from the token
  saveUserData(){
    if(localStorage.getItem('eToken')!=null){
      let encodeToken:any=localStorage.getItem('eToken');

      let decodeToken = jwtDecode(encodeToken);

      this.userDataToken=decodeToken;

      if (encodeToken) {
        this.userDataToken=jwtDecode(encodeToken)
      }
    }
  }
  getUserRoleByEmail(email: string): Observable<string> {
    
    return this._HttpClient.get<string>(`http://localhost:5275/api/Authentication/GetUserByEmail/${email}`);
  }
  getUserData(): any {
    this.saveUserData();
    return this.userDataToken;
  }
  setLogin(userData: Object): Observable<any> {
    return this._HttpClient.post(`http://localhost:5275/api/Authentication/login`, userData);
  }
  // Forgot password method
  // forgotPassword(email: string): Observable<any> {
  //   return this._HttpClient.post(`http://localhost:5275/api/Authentication/ForgotPassWord`, { email });
  // }
loginDashboard(userData: Object): Observable<any> {
    return this._HttpClient.post(`http://localhost:5275/api/Authentication/login-dashboard`, userData);
  }
  forgotPassword(email: string): Observable<any> {
    return this._HttpClient.post('http://localhost:5275/api/Authentication/ForgotPassword', { email });
  }
   // Reset password method
  //  resetPassword(email: string, code: string, newPassword: string): Observable<any> {
  //   return this._HttpClient.post(`http://localhost:5275/api/Authentication/ResetPassWord`, { email, code, newPassword });
  // }

  resetPassword(email: string, code: string, newPassword: string): Observable<any> {
    return this._HttpClient.post('http://localhost:5275/api/Authentication/ResetPassword', { email, code, newPassword });
  }

  setEmail(email: string) {
    this.email = email;
  }

  getEmail(): string {
    return this.email;
  }

  logOut(): void {
    this.userDataToken = null;
      localStorage.removeItem('eToken');
  }

}

