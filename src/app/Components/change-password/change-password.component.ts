import { Component } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './change-password.component.html',
  styleUrl: './change-password.component.css',
})
export class ChangePasswordComponent {
  currentPassword: string = '';
  newPassword: string = '';
  confirmNewPassword: string = '';
  changePasswordError: string = '';
  resultTitle: string = '';
  resultMessage: string = '';
  passwordPattern: RegExp = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%_*?&])[A-Za-z\d@$!%_*?&]{6,}$/;

  constructor(private http: HttpClient, private router: Router) {}
  changePassword(): void {
    if (this.newPassword !== this.confirmNewPassword) {
      this.changePasswordError = "كلمة المرور الجديدة والتأكيد لا يتطابقان.";
      return;
    }
        if (!this.passwordPattern.test(this.newPassword)) {
          this.changePasswordError = 'كلمة المرور الجديدة لا ينطبق عليها الشروط  .';
          return;
        }

    const token = localStorage.getItem('eToken');

    if (token) {
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

      const body = {
        currentPassword: this.currentPassword,
        newPassword: this.newPassword,
        confirmNewPassword: this.confirmNewPassword,
      };

      this.http
        .post('http://localhost:5275/api/Authentication/ChangePassword', body, {
          headers,
        })
        .subscribe(
          (response: any) => {
            console.log('Password changed successfully:', response);
            this.changePasswordError = '';
            this.clearPasswordFields();
            this.showResultModal('نجاح', 'تم تغيير كلمة المرور بنجاح.');
 
          setTimeout(() => {
            this.router.navigate(['/home']);  
          }, 5000);  
          },
          (error) => {
            console.error('Error changing password:', error);
            this.changePasswordError =
              error.error?.Error ||
              'كلمة المرور الحاليه غير صحيحة , فشل تغيير كلمة المرور. يرجى المحاولة مرة أخرى.';
          }
        );
    } else {
      this.changePasswordError = 'User is not authenticated.';
      console.error('User is not authenticated.');
    }
  }

  clearPasswordFields(): void {
    this.currentPassword = '';
    this.newPassword = '';
    this.confirmNewPassword = '';
  }
  showResultModal(title: string, message: string): void {
    this.resultTitle = title;
    this.resultMessage = message;

    const resultModalElement = document.getElementById('resultModal');
    if (resultModalElement) {
      const resultModal = new (window as any)['bootstrap'].Modal(
        resultModalElement
      );
      resultModal.show();
    }
  }
}
