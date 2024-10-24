// import { ChangeDetectorRef, Component, OnInit, PLATFORM_ID, Inject } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { HttpClient, HttpHeaders } from '@angular/common/http';
// import { AuthService } from '../../shared/services/auth.service';
// import {
//   FormsModule,
//   FormBuilder,
//   FormGroup,
//   Validators,
//   ReactiveFormsModule,
// } from '@angular/forms';
// import { SignalrService } from '../../shared/services/signalr.service';
// import { isPlatformBrowser } from '@angular/common';
// import { PatientService } from '../../shared/services/patient.service';
// import { Router, RouterModule } from '@angular/router';


// interface PatientFormData {
//   name: string;
//   age: number;
//   gender: number;
//   phoneNumber: string;
//   address: string;
//   patientId?: number;
//   [key: string]: string | number | boolean | undefined;
// }

// @Component({
//   selector: 'app-patient-chat',
//   standalone: true,
//   imports: [CommonModule, FormsModule, RouterModule, ReactiveFormsModule],
//   templateUrl: './patient-chat.component.html',
//   styleUrls: ['./patient-chat.component.css']
// })
// export class PatientChatComponent implements OnInit {
//   patientData: PatientFormData = {
//     name: '',
//     age: 0,
//     gender: 0,
//     phoneNumber: '',
//     address: '',
//     email: '',
//   };
//   patientId: number | undefined;
//   originalPatientData: any = {};
//   messages: { user: string; message: string }[] = [];
//   message = '';

//   constructor(
//     private signalrService: SignalrService,
//     private http: HttpClient,
//     private patientService: PatientService,
//     private fb: FormBuilder,
//     @Inject(PLATFORM_ID) private platformId: Object
//   ) {}

//   getLoggedInUserProfile(): void {
//     if (isPlatformBrowser(this.platformId)) {
//       const token = localStorage.getItem('eToken');

//       if (token) {
//         const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

//         this.http
//           .get<any>(
//             'http://localhost:5275/api/Patient/GetLoggedInPatientProfile',
//             { headers }
//           )
//           .subscribe(
//             (response) => {
//               console.log(response.name);
//               console.log('Patient data received:', response);
//               this.patientData = response;
//               this.originalPatientData = { ...response };
//               this.patientId = response.patientId;
//             },
//             (error) => {
//               console.error('Error fetching patient data:', error);
//             }
//           );
//       } else {
//         console.error('User is not authenticated.');
//       }
//     }
//   }

//   ngOnInit(): void {
//     this.signalrService.hubConnection.on('ReceiveMessage', (user: string, message: string) => {
//       this.messages.push({ user, message });
//     });

//     this.getLoggedInUserProfile();
//   }

//   sendMessage(): void {
//     if (this.message.trim()) {
//       this.signalrService.sendMessage(this.patientData.name, this.message);
//       this.message = '';
//     }
//   }

// }




import { ChangeDetectorRef, Component, OnInit, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../shared/services/auth.service';
import {
  FormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { SignalrService } from '../../shared/services/signalr.service';
import { isPlatformBrowser } from '@angular/common';
import { PatientService } from '../../shared/services/patient.service';
import { Router, RouterModule } from '@angular/router';

interface PatientFormData {
  name: string;
  age: number;
  gender: number;
  phoneNumber: string;
  address: string;
  patientId?: number;
  [key: string]: string | number | boolean | undefined;
}

@Component({
  selector: 'app-patient-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ReactiveFormsModule],
  templateUrl: './patient-chat.component.html',
  styleUrls: ['./patient-chat.component.css'] // Fixed 'styleUrl' to 'styleUrls'
})
export class PatientChatComponent implements OnInit {
  patientData: PatientFormData = {
    name: '',
    age: 0,
    gender: 0,
    phoneNumber: '',
    address: '',
    email: '',
  };
  patientId: number | undefined;
  originalPatientData: any = {};
  messages: { user: string; message: string }[] = [];
  message = '';

  constructor(
    private signalrService: SignalrService,
    private http: HttpClient,
    private patientService: PatientService,
    private fb: FormBuilder,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  getLoggedInUserProfile(): void {
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('eToken');

      if (token) {
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

        this.http
          .get<any>(
            'http://localhost:5275/api/Patient/GetLoggedInPatientProfile',
            { headers }
          )
          .subscribe(
            (response) => {
              console.log(response.name); // This logs the correct name to the console
              console.log('Patient data received:', response);
              this.patientData = response; // Update patientData with the response
              this.originalPatientData = { ...response };
              this.patientId = response.patientId;
            },
            (error) => {
              console.error('Error fetching patient data:', error);
            }
          );
      } else {
        console.error('User is not authenticated.');
      }
    }
  }

  ngOnInit(): void {
    // Listen for messages from doctors
    this.signalrService.hubConnection.on('ReceiveMessage', (user: string, message: string) => {
      this.messages.push({ user, message });
    });

    // Fetch the logged-in patient's profile and name
    this.getLoggedInUserProfile();
  }

  sendMessage(): void {
    if (this.message.trim()) {
      this.signalrService.sendMessage(this.patientData.name, this.message);
      this.message = '';
    }
  }
}
