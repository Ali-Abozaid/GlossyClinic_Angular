import { ChangeDetectorRef, Component, OnInit,PLATFORM_ID ,Inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../shared/services/auth.service';
import { CommonModule } from '@angular/common';

import {
  FormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { isPlatformBrowser } from '@angular/common';

import { PatientService } from '../../shared/services/patient.service';
import { Router, RouterModule } from '@angular/router';

interface MedicalCondition {
  key: string;
  name: string;
}



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
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  patientData: PatientFormData = {
    name: '',
    age: 0,
    gender: 0,
    phoneNumber: '',
    address: '',
    email: '',
  };
  editForm!: FormGroup;
  patientId: number | undefined;
  medicalConditions: MedicalCondition[] = [
    { key: 'hypertension', name: 'ارتفاع ضغط الدم' },
    { key: 'diabetes', name: 'مرض السكري' },
    { key: 'stomachAche', name: 'ألم المعدة' },
    { key: 'periodontalDisease', name: 'مرض اللثة' },
    { key: 'isPregnant', name: 'الحمل' },
    { key: 'isBreastfeeding', name: 'الرضاعة' },
    { key: 'isSmoking', name: 'التدخين' },
    { key: 'kidneyDiseases', name: 'أمراض الكلى' },
    { key: 'heartDiseases', name: 'أمراض القلب' },
  ];

  originalPatientData: any = {};

  appointments: any[] = [];
  showReportMessage: boolean = false;

  appointmentIdToCancel: number | null = null;
  resultTitle: string = '';
  resultMessage: string = '';

  isModalClosing = false;
  reportContent: string = ''; 

  constructor(
    private cd: ChangeDetectorRef,
    private http: HttpClient,
    private authService: AuthService,
    private patientService: PatientService,
    private fb: FormBuilder,    @Inject(PLATFORM_ID) private platformId: Object,

  ) {
    this.editForm = this.initForm();
  }

  initForm(): FormGroup {
    const form = this.fb.group({
      name: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[a-zA-Z\s]*$/),
          Validators.minLength(3),
          Validators.maxLength(50),
        ],
      ],
      age: [
        '',
        [
          Validators.required,
          Validators.min(1),
          Validators.max(100),
          Validators.pattern(/^[1-9][0-9]*$/),
        ],
      ],
      gender: ['', Validators.required],
      phoneNumber: [
        '',
        [Validators.required, Validators.pattern(/^(01)[0-2,5]{1}[0-9]{8}$/)],
      ],
      address: ['', Validators.required],
    }) as FormGroup & { [key: string]: any };

    this.medicalConditions.forEach((condition) => {
      form.addControl(condition.key, this.fb.control(false));
    });

    return form;
  }

  ngOnInit(): void {
    this.getLoggedInUserProfile();
    if (isPlatformBrowser(this.platformId)){
      const modalElement = document.getElementById('editProfileModal');
      if (modalElement) {
        modalElement.addEventListener('hide.bs.modal', () => {
          if (!this.isModalClosing) {
            this.closeEditModal();
          }
        });
      }
    }
  }

  
  formatTime(time: string): string {
    if (!time) return '';
    const [hours, minutes, seconds] = time.split(':');
    const formattedHours = +hours % 12 || 12;
    const period = +hours < 12 ? 'صباحا' : 'مساءا';
    const formattedMinutes = +minutes;
    const formattedSeconds = +seconds;
    return `${formattedHours}:${formattedMinutes}:${formattedSeconds} ${period}`;
  }

  getLoggedInUserProfile(): void {
    if (isPlatformBrowser(this.platformId)){
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
              console.log('Patient data received:', response);
              this.patientData = response;
              this.originalPatientData = { ...response };
              this.patientId = response.patientId;
              this.updateFormWithPatientData();
              if (this.patientId !== undefined) {
                this.getAppointments(this.patientId);
              } else {
                console.error('Patient ID is undefined.');
              }
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

  updateFormWithPatientData(): void {
    if (this.patientData) {
      const formData: PatientFormData = {
        name: this.patientData.name || '',
        age: this.patientData.age || 0,
        gender: this.patientData.gender || 0,
        phoneNumber: this.patientData.phoneNumber || '',
        address: this.patientData.address || '',
      };

      this.medicalConditions.forEach((condition) => {
        formData[condition.key] =
          (this.patientData[condition.key] as boolean) || false;
      });

      console.log('Patching form with data:', formData);
      this.editForm.patchValue(formData);
      this.editForm.updateValueAndValidity();
    } else {
      console.error('No patient data available to update the form.');
    }
  }

  getAppointments(patientId: number): void {
    const token = localStorage.getItem('eToken');
    if (token) {
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      this.http
        .get<any[]>(
          `http://localhost:5275/api/Appoinment/patient/${patientId}`,
          { headers }
        )
        .subscribe(
          (appointments) => {
            console.log('Patient data received:', appointments);

            this.appointments = appointments.map((app) => ({
              ...app,
              showReportMessage: false,
            }));
          },
          (error) => {
            console.error('Error fetching appointments:', error);
          }
        );
    } else {
      console.error('User is not authenticated.');
    }
  }

  cancelAppointment(appointmentId: number): void {
    this.appointmentIdToCancel = appointmentId;
    const modalElement = document.getElementById('cancelModal');
    if (modalElement) {
      const cancelModal = new (window as any)['bootstrap'].Modal(modalElement);
      cancelModal.show();
    }
  }

  confirmCancel(): void {
    if (this.appointmentIdToCancel) {
      const token = localStorage.getItem('eToken');

      if (token) {
        const headers = new HttpHeaders().set(
          'Authorization',
          `Bearer ${token}`
        );

        this.http
          .delete(
            `http://localhost:5275/api/Appoinment/${this.appointmentIdToCancel}`,
            { headers }
          )
          .subscribe(
            () => {
              this.hideCancelModal();
              this.appointments = this.appointments.filter(
                (appointment) =>
                  appointment.appointmentId !== this.appointmentIdToCancel
              );
              this.showResultModal('نجاح', 'تم الغاء الحجز بنجاح.');
            },
            (error) => {
              console.error('Error canceling appointment:', error);
              this.showResultModal('خطأ', 'من فضلك حاول مرة اخري .');
            }
          );
      } else {
        console.error('User is not authenticated.');
        this.showResultModal(
          'Error',
          'User is not authenticated. Please log in and try again.'
        );
      }
    }
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
  hideCancelModal(): void {
    const cancelModalElement = document.getElementById('cancelModal');
    if (cancelModalElement) {
      const cancelModal = (window as any)['bootstrap'].Modal.getInstance(
        cancelModalElement
      );
      if (cancelModal) {
        cancelModal.hide();
      }
    }
  }

  showDownloadMessage(): void {
    this.showReportMessage = true;
  }
  toggleDownloadMessage(appointment: any): void {
    appointment.showReportMessage = !appointment.showReportMessage;
  }
  openEditModal(): void {
    this.updateFormWithPatientData();
    const modalElement = document.getElementById('editProfileModal');
    if (modalElement) {
      const modal = new (window as any)['bootstrap'].Modal(modalElement);
      modal.show();
    }
  }
  saveChanges(): void {
    if (this.editForm.valid) {
      console.log('Form is valid, showing confirmation modal.');

      const modalElement = document.getElementById('confirmationModal');
      if (modalElement) {
        const modal = new (window as any)['bootstrap'].Modal(modalElement);
        modal.show();
      }
    } else {
      console.warn('Form is invalid, please check the fields.');
    }
  }
  isLoading: boolean = false;

  confirmSave(): void {
    if (this.patientId && this.editForm.valid) {
      this.patientService
        .updatePatientData(this.patientId, this.editForm.value)
        .subscribe({
          next: () => {
            window.location.reload();
          },
          error: (error) => {
            console.error('Error:', error);
          },
        });
    }
  }

  closeModals(): void {
    const editModalElement = document.getElementById('editProfileModal');
    const confirmModalElement = document.getElementById('confirmationModal');

    if (editModalElement) {
      const editModal = (window as any)['bootstrap'].Modal.getInstance(
        editModalElement
      );
      if (editModal) {
        editModal.hide();
      }
    }

    if (confirmModalElement) {
      const confirmModal = (window as any)['bootstrap'].Modal.getInstance(
        confirmModalElement
      );
      if (confirmModal) {
        confirmModal.hide();
      }
    }
  }

  get selectedMedicalConditions(): string[] {
    return this.medicalConditions
      .filter((condition) => this.editForm.get(condition.key)?.value)
      .map((condition) => condition.name);
  }

  closeEditModal(): void {
    this.isModalClosing = true;

    this.patientData = { ...this.originalPatientData };
    const modalElement = document.getElementById('editProfileModal');
    if (modalElement) {
      const bootstrapModal = (window as any)['bootstrap'].Modal.getInstance(
        modalElement
      );
      if (bootstrapModal) {
        bootstrapModal.hide();
      }
    }
    this.isModalClosing = false;
  }
  savePatientData(): void {
    if (this.patientId && this.patientData) {
      const token = localStorage.getItem('eToken');

      if (token) {
        const headers = new HttpHeaders().set(
          'Authorization',
          `Bearer ${token}`
        );

        this.patientService
          .updatePatientData(this.patientId, this.patientData)
          .subscribe(
            (response) => {
              console.log('Patient data updated successfully:', response);
              this.originalPatientData = { ...this.patientData };
              this.closeEditModal();
            },
            (error) => {
              console.error('Error updating patient data:', error);
            }
          );
      } else {
        console.error('User is not authenticated.');
      }
    } else {
      console.error('Missing patient ID or data.');
    }
  }

  openReportModal(report: string): void {
    this.reportContent = report;
    const reportModalElement = document.getElementById('reportModal');
    if (reportModalElement) {
      const reportModal = new (window as any).bootstrap.Modal(
        reportModalElement
      );
      reportModal.show();
    } else {
      console.error('Report modal element not found.');
    }
  }
}
