import { CommonModule, DOCUMENT } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

interface Doctor {
  doctorId: number;
  userId: string;
  name: string;
}

interface Branch {
  branchId: number;
  branchName: string;
}

interface WorkSchedule {
  doctorWorkBranchId: number;
  doctorName: string;
  branchName: string;
  day: string;
  isWork: boolean;
  startTime: string;
  endTime: string;
}

interface UpdateSchedule {
  doctorWorkBranchId: number;
  doctorName: string;
  branchName: string;
  day: string;
  isWork: boolean;
  startTime: string;
  endTime: string; 
}

@Component({
  selector: 'app-change-time-dashboard',
  standalone: true,
  imports: [FormsModule, CommonModule, ReactiveFormsModule],
  templateUrl: './change-time-dashboard.component.html',
  styleUrl: './change-time-dashboard.component.css'
})
export class ChangeTimeDashboardComponent implements OnInit {
  scheduleForm!: FormGroup;
  branches: Branch[] = [];
  existingSchedules: WorkSchedule[] = [];
  currentDoctorId: number | null = null;
  currentUserId: string | null = null;
  showSuccessModal: boolean = false;
  branchNameMapping: { [key: string]: string } = {
    'branch1': 'فرع القوصية',
    'branch2': 'فرع ابنوب'
  };
  arabicDays: { [key: string]: string } = {
    'Sunday': 'الأحد',
    'Monday': 'الاثنين',
    'Tuesday': 'الثلاثاء',
    'Wednesday': 'الأربعاء',
    'Thursday': 'الخميس',
    'Friday': 'الجمعة',
    'Saturday': 'السبت'
  };
  englishDays: string[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    @Inject(DOCUMENT) private document: Document
  ) {}

  ngOnInit() {
    this.getCurrentUser();
    this.initForm();
  }

  initForm() {
    this.scheduleForm = this.fb.group({
      branchId: [''],
      schedules: this.fb.array([])
    });

    this.scheduleForm.get('branchId')?.valueChanges.subscribe(() => this.loadSchedule());
  }

  getCurrentUser() {
    const token = this.document.defaultView?.localStorage?.getItem('eToken') ?? null;
    if (token) {
      try {
        const tokenPayload = JSON.parse(atob(token.split('.')[1]));
        this.currentUserId = tokenPayload.nameidentifier;

        this.http.get<Doctor[]>('http://localhost:5275/api/Doctor').subscribe(
          doctors => {
            const doctor = doctors.find(d => d.userId === this.currentUserId);
            if (doctor) {
              this.currentDoctorId = doctor.doctorId;
              this.loadBranches();
            } else {
              console.error('Current user is not a doctor');
            }
          },
          error => console.error('Error fetching doctor information:', error)
        );
      } catch (error) {
        console.error('Error decoding token:', error);
      }
    } else {
      console.error('No token found');
    }
  }

  loadBranches() {
    this.http.get<Branch[]>('http://localhost:5275/api/Branch').subscribe(
      branches => this.branches = branches
    );
  }

  get schedules() {
    return this.scheduleForm.get('schedules') as FormArray;
  }

  loadSchedule() {
    const branchId = this.scheduleForm.get('branchId')?.value;
  
    if (this.currentDoctorId && branchId) {
      this.http.get<{ name: string }>(`http://localhost:5275/api/doctor/${this.currentDoctorId}`).subscribe(
        doctorResponse => {
          const doctorName = doctorResponse.name;
          
          this.http.get<{ branchName: string }>(`http://localhost:5275/api/branch/${branchId}`).subscribe(
            branchResponse => {
              const branchName = branchResponse.branchName;

              this.http.get<WorkSchedule[]>('http://localhost:5275/api/DoctorWorkBranch').subscribe(
                schedules => {
                  this.existingSchedules = schedules.filter(schedule => 
                    schedule.doctorName === doctorName && schedule.branchName === branchName
                  );
                  
                  this.updateScheduleForm(this.existingSchedules);
                }
              );
            }
          );
        }
      );
    }
  }

  updateScheduleForm(schedules: WorkSchedule[]) {
    const schedulesFormArray = this.scheduleForm.get('schedules') as FormArray;
    schedulesFormArray.clear();

    const today = new Date();
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 1));

    schedules.forEach((schedule) => {
      const dayIndex = this.englishDays.indexOf(schedule.day);
      const currentDate = new Date(startOfWeek);
      currentDate.setDate(startOfWeek.getDate() + dayIndex);

      const formattedDate = `${currentDate.getDate().toString().padStart(2, '0')}/${(currentDate.getMonth() + 1).toString().padStart(2, '0')}/${currentDate.getFullYear()}`;
      const dayName = this.arabicDays[schedule.day];

      const scheduleGroup = this.fb.group({
        doctorWorkBranchId: [schedule.doctorWorkBranchId],
        day: [schedule.day],
        displayDay: [`${dayName} ${formattedDate}`],
        startTime: [this.formatTimeForDisplay(schedule.startTime), Validators.required],
        endTime: [this.formatTimeForDisplay(schedule.endTime), Validators.required],
        isWork: [schedule.isWork]
      });

      scheduleGroup.get('startTime')?.valueChanges.subscribe(() => this.updateEndTimeValidation(scheduleGroup));
      scheduleGroup.get('endTime')?.valueChanges.subscribe(() => this.validateEndTime(scheduleGroup));

      schedulesFormArray.push(scheduleGroup);
    });
  }
  updateEndTimeValidation(scheduleGroup: FormGroup) {
    const startTime = scheduleGroup.get('startTime')?.value;
    const endTimeControl = scheduleGroup.get('endTime');
    
    if (startTime && endTimeControl) {
      endTimeControl.setValidators([Validators.required, this.endTimeValidator(startTime)]);
      endTimeControl.updateValueAndValidity();
    }
  }

  validateEndTime(scheduleGroup: FormGroup) {
    const startTime = scheduleGroup.get('startTime')?.value;
    const endTime = scheduleGroup.get('endTime')?.value;
    
    if (startTime && endTime) {
      const isValid = this.isEndTimeValid(startTime, endTime);
      if (!isValid) {
        scheduleGroup.get('endTime')?.setErrors({ 'invalidEndTime': true });
      }
    }
  }

  endTimeValidator(startTime: string) {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const endTime = control.value;
      if (startTime && endTime) {
        return this.isEndTimeValid(startTime, endTime) ? null : { 'invalidEndTime': true };
      }
      return null;
    };
  }

  isEndTimeValid(startTime: string, endTime: string): boolean {
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    return end > start;
  }

  onSubmit() {
    const formValue = this.scheduleForm.value;
    const updatedSchedules: UpdateSchedule[] = [];

    formValue.schedules.forEach((schedule: any) => {
      const existingSchedule = this.existingSchedules.find(s => s.doctorWorkBranchId === schedule.doctorWorkBranchId);
      
      if (existingSchedule &&
          (existingSchedule.startTime !== schedule.startTime ||
           existingSchedule.endTime !== schedule.endTime ||
           existingSchedule.isWork !== schedule.isWork)) {
        
        updatedSchedules.push({
          doctorWorkBranchId: schedule.doctorWorkBranchId,
          doctorName: existingSchedule.doctorName,
          branchName: existingSchedule.branchName,
          day: schedule.day, 
          isWork: schedule.isWork,
          startTime: this.formatTimeForServer(schedule.startTime),
          endTime: this.formatTimeForServer(schedule.endTime)
        });
      }
    });

    updatedSchedules.forEach(schedule => {
      this.http.put(`http://localhost:5275/api/DoctorWorkBranch/${schedule.doctorWorkBranchId}`, schedule).subscribe(
        response => {
          this.showSuccessModal = true;
          console.log('Schedule updated successfully', response);
        },
        error => {
          console.error('Error updating schedule', error);
        }
      );
    });
  }

  formatTimeForServer(time: string): string {
    return `${time}:00`;
  }

  formatTimeForDisplay(time: string): string {
    return time.substring(0, 5);
  }
  getBranchDisplayName(branchName: string): string {
    return this.branchNameMapping[branchName] || branchName;
  }
  closeSuccessModal() {
    this.showSuccessModal = false;
    location.reload();
  }
}