import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PasswordService } from '../../shared/services/password.service';
import { Router } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';
import { Observable } from 'rxjs';



@Component({
  selector: 'app-update-branch-password-dashboard',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './update-branch-password-dashboard.component.html',
  styleUrl: './update-branch-password-dashboard.component.css'
})
export class UpdateBranchPasswordDashboardComponent {
  showPassword: boolean = false;
  email: string = '';
  code: string = '';
  newPassword: string = '';
  confirmPassword: string = '';
  emailNotFound: boolean = false;
  errors: string[] = [];
  successMessage: string | null = null;
  token: string = localStorage.getItem('eToken') || '';
  doctorEmail: string = '';
  resetCode: string = '';
  showCodePopup: boolean = false; 
  verificationError: string | null = null;
  role: string = '';
  passwordMismatch: boolean = false;
  resultTitle: string = '';
  resultMessage: string = '';

  passwordRequirements: {
    minLength: boolean;
    hasUpperCase: boolean;
    hasLowerCase: boolean;
    hasNumber: boolean;
    hasSpecialChar: boolean;
  } = {
      minLength: false,
      hasUpperCase: false,
      hasLowerCase: false,
      hasNumber: false,
      hasSpecialChar: false,
    };

  constructor(private passwordService: PasswordService, private _Router: Router, private authservice: AuthService) { }
  ngOnInit() {
    this.getAdminEmail();
  }
  getAdminEmail() {
    const token = this.authservice.getUserData();
    this.doctorEmail = token.name;
    console.log("Logged user email:", this.email);
  }
  getUserRole(): Observable<string> {
    const token = this.authservice.getUserData();
    this.role = token.role;
    console.log("Logged user role:", this.role);
    return new Observable(observer => {
      observer.next(this.role);
      observer.complete();
    });
  }

  sendVerificationCodeToAdmin() {
    this.getUserRole().subscribe({
      next: (role) => {
        if (role === 'Admin') {
          if (this.email === this.doctorEmail) {
            this.sendVerificationCode();
          } else {
            this.authservice.getUserRoleByEmail(this.email).subscribe({
              next: (emailData) => {
                const parsedData = typeof emailData === 'string' ? JSON.parse(emailData) : emailData;

                const emailRole = parsedData.roles ? parsedData.roles[0] : null;
                console.log('emailRole', emailRole)
                if (emailRole === 'Secretary') {
                  this.sendVerificationCode();
                } else {
                  this.errors.push('يمكنك تغير كلمه السر الخاصه بك او بالفروع فقط');
                }
              },
              error: (error) => {
                console.log('Error checking email role:', error);
                this.errors.push('حدث خطأ أثناء التحقق من دور البريد الإلكتروني.');
              }
            });
          }
        } else {
          this.errors.push('العملية مسموحة فقط لمستخدمي Admin.');
        }
      },
      error: (error) => {
        console.log('Error checking user role:', error);
        this.errors.push('حدث خطأ أثناء التحقق من دور المستخدم.');
      }
    });
  }

  sendVerificationCode() {
    this.errors = [];
    this.successMessage = null;
    this.passwordService.sendResetCode(this.doctorEmail).subscribe({
      next: (response) => {
        console.log('Verification code sent to email.');
        this.successMessage = 'تم إرسال كود إعادة تعيين كلمة المرور إلى بريدك الإلكتروني';
        this.errors = [];
        this.showCodePopup = true;
      },
      error: (error) => {
        console.log('Error sending verification code:', error);
        this.errors = ['حدث خطأ أثناء إرسال الكود.'];
        this.successMessage = null;
      }
    });
  }

  showResultModal(title: string, message: string): void {
    this.resultTitle = title;
    this.resultMessage = message;

    const resultModalElement = document.getElementById('resultModal');
    if (resultModalElement) {
      const resultModal = new (window as any)['bootstrap'].Modal(resultModalElement);
      resultModal.show();
    }
  }
  verifyCode() {
    this.errors = [];
    this.successMessage = null;

    this.passwordService.verifyResetCode(this.doctorEmail, this.resetCode).subscribe({
      next: response => {
        console.log(response);
        if (response.message === "Code is valid.") {
          this.passwordService.changePassword(this.email, this.newPassword, this.confirmPassword).subscribe({
            next: response => {
              this.showCodePopup = false;
              this.showResultModal('نجاح', 'تم تغير كلمه السر بنجاح');

              this.email = '';
              this.resetCode = '';
              this.newPassword = '';
              this.confirmPassword = '';
            },
          });
        } else {
          this.verificationError = 'الكود غير صحيح';
        }
      },
      error: (err) => {
        this.verificationError = 'حدث خطأ أثناء التحقق من الكود.';
        console.log(err);
      }
    });
  }

  onPasswordChange() {
    this.passwordRequirements.minLength = this.newPassword.length >= 6;
    this.passwordRequirements.hasUpperCase = /[A-Z]/.test(this.newPassword);
    this.passwordRequirements.hasLowerCase = /[a-z]/.test(this.newPassword);
    this.passwordRequirements.hasNumber = /\d/.test(this.newPassword);
    this.passwordRequirements.hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(this.newPassword);
  }


  get isPasswordValid(): boolean {
    return this.newPassword.length >= 6;
  }
  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
  closePopup() {
    this.showCodePopup = false; 
  }
  checkPasswordMatch() {
    if (this.newPassword && this.confirmPassword) {
      this.passwordMismatch = this.newPassword !== this.confirmPassword;
    } else {
      this.passwordMismatch = false; 
    }
  }
}
