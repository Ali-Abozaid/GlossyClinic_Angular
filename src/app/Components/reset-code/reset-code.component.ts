import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router ,ActivatedRoute } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-reset-code',
  standalone: true,
  templateUrl: './reset-code.component.html',
  styleUrls: ['./reset-code.component.css'],
  imports: [ReactiveFormsModule, CommonModule]
})
export class ResetCodeComponent implements OnInit {
  email: string = '';
  isLoading: boolean = false;
  msgError: string = '';
  displayStyle="none";
  shouldNavigateAfterClose = false;

  resetPasswordForm: FormGroup = new FormGroup({
    code: new FormControl('', [Validators.required]),
    newPassword: new FormControl('',[Validators.required,Validators.pattern(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*\W).{6,}$/)
    ]),
  });

  constructor(private _AuthService: AuthService, private _Router: Router, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.email = this._AuthService.getEmail();
  }

  resetPassword(): void {
    if (this.resetPasswordForm.valid) {
      this.isLoading = true;
      const code = this.resetPasswordForm.value.code;
      const newPassword = this.resetPasswordForm.value.newPassword;

      this._AuthService.resetPassword(this.email, code, newPassword).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.openPopup();
          this.shouldNavigateAfterClose = true;

        },
        error: (err) => {
          this.isLoading = false;
          if(err.error.error== "Invalid reset code."){
              this.msgError="الكود غير صحيح";
          }else if(err.error.error== "Reset code has expired."){
            this.msgError="انتهت مدة صلاحية الكود حاول مرةاخري"
          }else{
            this.msgError ="حاول مرة اخري";
          }
        }
      });
    } else {
      this.resetPasswordForm.markAllAsTouched();
    }
  }



   
closePopup(): void {
  this.displayStyle = 'none';
  if (this.shouldNavigateAfterClose) {
    this._Router.navigate(['/login']);
    this.shouldNavigateAfterClose = false; // Reset the flag after navigation
  }
}

openPopup() { 
  this.displayStyle = "block"; 
} 
}



