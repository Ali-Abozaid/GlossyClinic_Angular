import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../shared/services/auth.service';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-login-dashboard',
  standalone: true,
  imports: [FormsModule, CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login-dashboard.component.html',
  styleUrls: ['./login-dashboard.component.css']  // Fix typo from styleUrl to styleUrls
})
export class LoginDashboardComponent implements OnInit {
  isLoading: boolean = false;
  showPassword: boolean = false;
  msgError: string = '';

  loginForm: FormGroup = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(6),
      Validators.maxLength(100)
    ])
  });

  constructor(private _AuthService: AuthService, private _Router: Router) {}

  ngOnInit(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem('eToken');
    }  }

    handleForm(): void {
      this.isLoading = true;
      if (this.loginForm.valid) {
        this._AuthService.loginDashboard(this.loginForm.value).subscribe({
          next: (response) => {
            localStorage.setItem('eToken', response.token);
            this.isLoading = false;
            this._AuthService.saveUserData();
            this._Router.navigate(['/DashboardGloosy/home']);
          },
          error: (err: HttpErrorResponse) => {
            this.isLoading = false;
    
            // Log the entire error response to inspect it
            console.error('Error response:', err);
    
            // Ensure err.error exists and handle error based on actual structure
            if (err.error && err.error.error) {
              if (err.error.error === "Invalid email or password.") {
                this.msgError = "البريد الإلكتروني أو كلمة السر غير صالحة.";          
              } else {
                this.msgError = "حاول مرة اخري في وقت اخر";
              }
            } else if (err.message) {
              // Handle generic network or client-side errors
              this.msgError = `Network or client-side error: ${err.message}`;
            } else {
              // Default error message if no structured error is found
              this.msgError = "حدث خطأ غير متوقع. حاول مرة أخرى.";
            }
          }
        });
      } else {
        this.isLoading = false;
        this.loginForm.markAllAsTouched();
      }
    }
    
  
  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
}
