
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css'],
  imports: [ReactiveFormsModule,CommonModule]
})
export class ForgotPasswordComponent implements OnInit {
  forgotPasswordForm!: FormGroup; // Non-null assertion operator
  msgErorr:string='';
  isloading:boolean=false;
  email: string = '';
  displayStyle="none";
  shouldNavigateAfterClose = false;


  constructor(private router: Router, private _AuthService: AuthService) { } // Inject AuthService

  ngOnInit(): void {
    this.forgotPasswordForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]) // Validators for required and email format
    });
  }

  onSubmit(): void {
    this.isloading=true;
    if (this.forgotPasswordForm.valid) {
      this.email = this.forgotPasswordForm.value.email;
      this._AuthService.setEmail(this.email);
      this._AuthService.forgotPassword(this.email).subscribe({
        next: (response) => {
          this.isloading=false;
          this.openPopup();
          this.shouldNavigateAfterClose = true;
        },
        error: (err) => {
          this.isloading=false;
          if(err.error.error=="User not found."){
            this.msgErorr="هذا المستخدم غير موجود";
          }else{
            this.msgErorr="حاول مرة اخري في وقت اخر"
          }
          
        }
      });
    } else {
      this.forgotPasswordForm.markAllAsTouched();
    }
  }

  
   
  closePopup(): void {
    this.displayStyle = 'none';
    if (this.shouldNavigateAfterClose) {
      this.router.navigate(['/ResetCode']);
      this.shouldNavigateAfterClose = false; // Reset the flag after navigation
    }
  }

 openPopup() { 
    this.displayStyle = "block"; 
  } 
}










