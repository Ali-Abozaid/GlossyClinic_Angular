// import { Component, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { SignalrService } from '../../shared/services/signalr.service';

// @Component({
//   selector: 'app-doctor-chat',
//   standalone: true,
//   imports: [CommonModule, FormsModule],
//   templateUrl: './doctor-chat.component.html',
//   styleUrl: './doctor-chat.component.css'
// })
// export class DoctorChatComponent {
//   messages: { user: string; message: string }[] = [];
//   doctorName = 'Gloocy';
//   message = '';
//  // selectedPatientId = 'FhTBEDgCAFx1q4x4C-Rqpg';
//  selectedPatientId = '';  // Keep this as the patient name
// // Assuming you have a list of patients to select from
// patients: { name: string; connectionId: string }[] = [
//   { name: 'Patient 1', connectionId: 'FhTBEDgCAFx1q4x4C-Rqpg' },
//   { name: 'Patient 2', connectionId: 'AnotherConnectionId' }
// ];
//   constructor(private chatService: SignalrService) {}
//   ngOnInit(): void {
//     // Listen for messages from patients
//     this.chatService.hubConnection.on('ReceiveMessage', (user: string, message: string) => {
//       this.messages.push({ user, message });
//     });
//   }

//   // sendMessage(): void {
//   //   if (this.message.trim() && this.selectedPatientId) {
//   //     this.chatService.sendDoctorReply(this.doctorName, this.message, this.selectedPatientId);
//   //     this.message = '';
//   //   }
//   // }
//   sendMessage(): void {
//     if (this.message.trim() && this.selectedPatientId) {
//         this.chatService.sendDoctorReply(this.doctorName, this.message, this.selectedPatientId);
//         console.log(this.selectedPatientId);
//         this.message = '';
//     }
// }
// selectPatient(patientName: string): void {
//   this.selectedPatientId = patientName;  // Set the selected patient name (patientId)
// }
// }





import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SignalrService } from '../../shared/services/signalr.service';

@Component({
  selector: 'app-doctor-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './doctor-chat.component.html',
  styleUrl: './doctor-chat.component.css'
})
export class DoctorChatComponent {
  messages: { user: string; message: string }[] = [];
  doctorName = 'Gloocy';
  message = '';
  selectedPatientId = 't4WzfYiQR7dSUPLqjc60RQ';  // Example patient ID

  constructor(private chatService: SignalrService) {}
  ngOnInit(): void {
    // Listen for messages from patients
    this.chatService.hubConnection.on('ReceiveMessage', (user: string, message: string) => {
      this.messages.push({ user, message });
    });
  }

  sendMessage(): void {
    if (this.message.trim() && this.selectedPatientId) {
      this.chatService.sendDoctorReply(this.doctorName, this.message, this.selectedPatientId);
      this.message = '';
    }
  }
} 
