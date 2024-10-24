import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../shared/services/auth.service';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  isLoading:boolean=false;
  showPassword: boolean = false;

  msgErorr:string='';

  constructor(private _AuthService:AuthService,private _Router:Router) {}
  ngOnInit(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem('eToken');
    }  }

    loginForm:FormGroup=new FormGroup({
    email:new FormControl('',[Validators.required,Validators.email]),
    password:new FormControl('', [
      Validators.required,
      Validators.minLength(6),
      Validators.maxLength(100)
    ])
  });

  handelform():void{
    this.isLoading=true;
    if(this.loginForm.valid){
      this._AuthService.setLogin(this.loginForm.value).subscribe({
        next:(response)=>{
          localStorage.setItem('eToken',response.token);

          this.isLoading=false;
          this._AuthService.saveUserData();


          this._Router.navigate(['/home']);
                },
        error:(err:HttpErrorResponse)=>{
          this.isLoading=false;
          if(err.error.error=="Invalid email or password."){
            this.msgErorr="البريد الإلكتروني أو كلمة السر غير صالحة.";          
          }else{
            this.msgErorr="حاول مرة اخري في وقت اخر"
          }
        }
      })
    }
    else{
      this.isLoading=false;
      this.loginForm.markAllAsTouched();
    }
  }

  togglePasswordVisibility() {
      this.showPassword = !this.showPassword;
  }
}
