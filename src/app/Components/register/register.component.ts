import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators} from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../Services/auth.service';
import { CommonModule } from '@angular/common';
import { MustMatch } from '../../Validator/must-match.validator';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule,CommonModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})

export class RegisterComponent implements OnInit {

  registerForm!: FormGroup;
  loading = false;
  error = '';
  showPassword = false;
  passwordStrength = 0;
  showPasswordRequirements = false;
  showSuccessModal: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router

  ) { }
  emailValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    
    const email = control.value.toLowerCase();
    
    if (!emailPattern.test(email)) {
      return { invalidEmail: true };
    }
    
    if (email.includes('..')) {
      return { invalidEmail: true }; 
    }
    
    if (email.split('@')[0].length === 0) {
      return { invalidEmail: true }; 
    }
    
    return null;
  }
  
  ngOnInit() {
    this.registerForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email, this.emailValidator]],
      name: ['', [
        Validators.required,
        Validators.pattern('^[a-zA-Z\u0600-\u06FF ]+$')
      ]],
      age: ['', [Validators.required, Validators.min(1)]],
      password: ['', [
        Validators.required,
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/),
        Validators.minLength(6)
      ]],
      confirmPassword: ['', Validators.required],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^(?:\+20|0)?1[0125]\d{8}$/)]],
      gender: ['', Validators.required],
      address: ['', Validators.required],
      hypertension: [false],
      diabetes: [false],
      stomachAche: [false],
      periodontalDisease: [false],
      isPregnant: [false],
      isBreastfeeding: [false],
      isSmoking: [false],
      kidneyDiseases: [false],
      heartDiseases: [false]
    }, {
      validator: MustMatch('password', 'confirmPassword')
    });

    this.registerForm.get('password')?.valueChanges.subscribe(() => {
      this.updatePasswordStrength();
      this.updateShowPasswordRequirements();
    });
  }

  onSubmit() {
    if (this.registerForm.invalid) {
      return;
    }
    this.loading = true;
    this.authService.register(this.registerForm.value).subscribe({
      next: () => {
        this.loading = false;
        this.registerForm.reset({}, { emitEvent: false });
        this.passwordStrength = 0;
        this.showPasswordRequirements = false;
        this.showSuccessModal = true;
      },
      error: (err) => {
        console.log(err);
        this.loading = false;
        if (err.error && err.error.error === "Email is already registered!") {
          this.registerForm.get('email')?.setErrors({ emailInUse: true });
        } else {
          this.error = err.error?.error || 'هناك خطأ حاول مرة اخرى.';
        }
      }
    });
  }
  closeSuccessModal() {
    this.showSuccessModal = false;
    location.reload();
  }
  redirectToLoginPage() {
    this.router.navigate(['/login']);
  }
  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
  updateShowPasswordRequirements() {
    this.showPasswordRequirements = !this.allPasswordRequirementsMet;
  }
  
  get passwordMeetsLength() {
    return this.registerForm.get('password')?.value.length >= 6;
  }

  get passwordHasLetterCase() {
    const password = this.registerForm.get('password')?.value;
    return /[a-z]/.test(password) && /[A-Z]/.test(password);
  }

  get passwordHasNumber() {
    return /[0-9]/.test(this.registerForm.get('password')?.value);
  }

  get passwordHasSpecialChar() {
    return /[@$!%*?&]/.test(this.registerForm.get('password')?.value);
  }

  get allPasswordRequirementsMet() {
    return this.passwordMeetsLength &&
           this.passwordHasLetterCase &&
           this.passwordHasNumber &&
           this.passwordHasSpecialChar;
  }
  updatePasswordStrength() {
    const password = this.registerForm.get('password')?.value;
    if (!password) {
      this.passwordStrength = 0;
      return;
    }
    
    let strength = 0;
    if (this.passwordMeetsLength) strength += 20;
    if (this.passwordHasLetterCase) strength += 40;
    if (this.passwordHasNumber) strength += 20;
    if (this.passwordHasSpecialChar) strength += 20;
    this.passwordStrength = strength;
  }
  
  getStrengthClass() {
    if (this.passwordStrength <= 40) return 'strength-weak';
    if (this.passwordStrength <= 80) return 'strength-medium';
    return 'strength-strong';
  }
}
