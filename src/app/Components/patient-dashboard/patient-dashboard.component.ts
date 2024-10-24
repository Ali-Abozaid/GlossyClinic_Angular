import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { PatientService } from '../../shared/services/patient.service';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerInputEvent, MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { BookComponent } from '../book/book.component';
import { HttpClient } from '@angular/common/http';
import { interval, startWith, Subscription, switchMap } from 'rxjs';



interface Appointment {
  appointmentId: number;
  cost: number;
  time: string;
  date: string;
  reports: string;
  type: number;
  doctorName: string;
  patientName: string;
}

interface AppointmentType {
  id: number;
  name: string;
}

interface Doctor {
  doctorId: number;
  name: string;
}

interface Branch {
  branchId: number;
  branchName: string;
  branchLocation: string;
}

interface DoctorWorkBranch {
  doctorWorkBranchId: number;
  doctorName: string;
  branchName: string;
  day: string;
  isWork: boolean;
  startTime: string;
  endTime: string;
}

interface TimeSlot {
  time: string;
  isSelected: boolean;
  isDisabled?: boolean;
}

interface Patient {
  patientId: number;
  name: string;
  gender: number;
  age: number;
  phoneNumber: string;
  address: string;
  userId: string;
}
interface BranchOption {
  value: string;
  label: string;
}

@Component({
  selector: 'app-patient-dashboard',
  standalone: true,
  imports: [CommonModule,FormsModule,ReactiveFormsModule,NgxPaginationModule,BookComponent,MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatInputModule],
  templateUrl: './patient-dashboard.component.html',
  styleUrl: './patient-dashboard.component.css',
  encapsulation: ViewEncapsulation.None

})
export class PatientDashboardComponent implements OnInit {

  currentPage: number = 1;
  patientData:any[]=[]  

  appointmentForm: FormGroup;
  doctors: Doctor[] = [];
  branches: Branch[] = [];
  doctorWorkBranches: DoctorWorkBranch[] = [];
  availableTimes: string[] = [];
  error: string | null = null;
  selectedDoctor: Doctor | null = null;
  selectedBranch: Branch | null = null;
  timeSlots: TimeSlot[] = []; 
  currentPatient: Patient | null = null;
  existingAppointments: Appointment[] = [];
  private updateSubscription: Subscription | null = null;
  appointmentTypes: AppointmentType[] = [
    { id: 0, name: 'كشف' },
    { id: 1, name: 'اعاده' },
    { id: 2, name: 'تجميل' },
    { id: 3, name: 'زراعه' },
    { id: 4, name: 'علاج الجذور وحشو العصب' },
    { id: 5, name: 'حشو عادي' },
    { id: 6, name: 'تقويم' },
    { id: 7, name: 'امراض و تجميل اللثه' },
    { id: 8, name: 'جراحه الوجه و الفكين' },
    { id: 9, name: 'معمل الاسنان' }
  ];
  showSuccessModal: boolean = false;
  branchOptions: BranchOption[] = [
    { value: '', label: 'كل الفروع' },
    { value: 'branch1', label: 'فرع القوصية' },
    { value: 'branch2', label: 'فرع ابنوب' }
  ];


  constructor(private _PatientService:PatientService,private fb: FormBuilder,
    private http: HttpClient) {
      this.appointmentForm = this.fb.group({
        doctor: ['', Validators.required],
        branch: ['', Validators.required],
        date: ['', Validators.required],
        time: ['', Validators.required],
        type: ['', [Validators.required, Validators.min(0), Validators.max(9)]]
      });
    }

  ngOnInit(): void {
    this.getPatient();
    this.fetchDoctors();
    this.fetchBranches();
    this.fetchDoctorWorkBranches();
  }


  searchTerm: string = '';

  filteredPatients() {
    if (!this.searchTerm) {
      return this.patientData;
    }

    return this.patientData.filter(patient =>
      patient.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      patient.phoneNumber.includes(this.searchTerm)
    );
  }

  EditForm:FormGroup=new FormGroup({
    phoneNumber:new FormControl('',[Validators.required,Validators.pattern(/^01[0125][0-9]{8}$/)])
  })

  getPatient(){
    this._PatientService.getPatientData().subscribe({
      next:(response)=>{
        this.patientData=response;
      },
      error:(err)=>{
        console.log(err);        
      }
    })
  }

  onEditPatient(patientId:number){
    const patient=this.patientData.find(p=>p.patientId===patientId);
    if(patient){
        this._PatientService.updatePatientData(patientId,patient).subscribe({
          next:(response)=>{
            this.getPatient();
          }
        })
      }
    }

  onDeletePatient(patientId:number){
    this._PatientService.DeletePatientData(patientId).subscribe({
      next:(response)=>{
        this.getPatient();
      }
    })
  }
  


// boooooking


ngOnDestroy() {
  this.stopPolling();
}

private startPolling() {
  // Poll every 10 seconds
  this.updateSubscription = interval(10000)
    .pipe(
      startWith(0),
      switchMap(() => {
        if (this.selectedDoctor && this.appointmentForm.get('date')?.value) {
          return this.http.get<Appointment[]>('http://localhost:37439/api/Appoinment');
        }
        return [];
      })
    )
    .subscribe(
      (appointments) => {
        if (appointments.length > 0) {
          this.updateExistingAppointments(appointments);
        }
      },
      (error) => {
        console.error('Error fetching appointments:', error);
      }
    );
}
closeSuccessModal() {
  this.showSuccessModal = false;
  location.reload();
}
private updateExistingAppointments(appointments: Appointment[]) {
  const selectedDate = this.appointmentForm.get('date')?.value;
  if (this.selectedDoctor && selectedDate) {
    this.existingAppointments = appointments.filter(apt => 
      apt.doctorName === this.selectedDoctor?.name && 
      this.isSameDay(new Date(apt.date), selectedDate)
    );
    this.updateTimeSlotsAvailability();
  }
}

private stopPolling() {
  if (this.updateSubscription) {
    this.updateSubscription.unsubscribe();
    this.updateSubscription = null;
  }
}

fetchDoctors() {
  this.http.get<any[]>('http://localhost:37439/api/Doctor').subscribe(
    (data) => this.doctors = data,
    (error) => this.error = 'Failed to fetch doctors. Please try again.'
  );
  console.log(this.doctors)
  
}

fetchBranches() {
  this.http.get<any[]>('http://localhost:37439/api/Branch').subscribe(
    (data) => this.branches = data,
    (error) => this.error = 'Failed to fetch branches. Please try again.'
  );
}

fetchDoctorWorkBranches() {
  this.http.get<DoctorWorkBranch[]>('http://localhost:37439/api/DoctorWorkBranch').subscribe(
    (data) => {
      this.doctorWorkBranches = data;
      console.log('Doctor Work Branches:', this.doctorWorkBranches);
    },
    (error) => this.error = 'Failed to fetch doctor schedules. Please try again.'
  );
}

onDoctorSelect() {
  const doctorId = Number(this.appointmentForm.get('doctor')?.value);
  this.selectedDoctor = this.doctors.find(d => d.doctorId === doctorId) || null;
  console.log('Selected Doctor:', this.selectedDoctor);
  this.resetForm(['branch', 'date', 'time']);
  
}

onBranchSelect() {
  const branchId = Number(this.appointmentForm.get('branch')?.value);
  this.selectedBranch = this.branches.find(b => b.branchId === branchId) || null;
  console.log('Selected Branch:', this.selectedBranch);
  console.log('Available Work Days:', this.getAvailableWorkDays());
  this.resetForm(['date', 'time']);
}
getBranchLabel(branchValue: string): string {
  const branch = this.branchOptions.find(option => option.value === branchValue);
  return branch ? branch.label : 'Unknown Branch';
}

getAvailableWorkDays(): string[] {
  if (!this.selectedDoctor || !this.selectedBranch) return [];
  console.log(this.doctorWorkBranches)
  return this.doctorWorkBranches
    .filter(wb => 
      wb.doctorName === this.selectedDoctor?.name && 
      wb.branchName === this.selectedBranch?.branchName &&
      wb.isWork
    )
    .map(wb => wb.day);
}

dateFilter = (date: Date | null): boolean => {
  if (!date) {
    return false;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset time to start of day for accurate comparison

  // Check if the date is in the past
  if (date < today) {
    return false;
  }

  if (!this.selectedDoctor || !this.selectedBranch) {
    return false;
  }

  const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
  const availableWorkDays = this.getAvailableWorkDays();
  
  console.log('Checking date:', date);
  console.log('Day name:', dayName);
  console.log('Available work days:', availableWorkDays);

  return availableWorkDays.includes(dayName);
}

resetForm(fields: string[]) {
  const updates: {[key: string]: any} = {};
  fields.forEach(field => updates[field] = '');
  this.appointmentForm.patchValue(updates);
  this.availableTimes = [];
}

fetchExistingAppointments(date: Date, doctorName: string) {
  // Format the date to match API's expected format
  const formattedDate = date.toISOString();
  
  this.http.get<Appointment[]>('http://localhost:37439/api/Appoinment')
    .subscribe(
      appointments => {

        this.existingAppointments = appointments.filter(apt => 
          apt.doctorName === doctorName && 
          this.isSameDay(new Date(apt.date), date)
        );
        console.log('Existing appointments:', this.existingAppointments);
        

        if (this.selectedDoctor && this.selectedBranch) {
          const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
          const workBranch = this.getDoctorWorkBranch(dayName);
          if (workBranch) {
            this.timeSlots = this.generateTimeSlots(workBranch.startTime, workBranch.endTime);
            this.updateTimeSlotsAvailability();
          }
        }
      },
      error => {
        this.error = 'Failed to fetch existing appointments';
        console.error('Error fetching appointments:', error);
      }
    );
}

private isSameDay(date1: Date, date2: Date): boolean {
  return date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate();
}

private getDoctorWorkBranch(dayName: string): DoctorWorkBranch | undefined {
  return this.doctorWorkBranches.find(wb => 
    wb.doctorName === this.selectedDoctor?.name && 
    wb.branchName === this.selectedBranch?.branchName && 
    wb.day === dayName &&
    wb.isWork
  );
}

onDateSelect(event: MatDatepickerInputEvent<Date>) {
  if (!event.value || !this.selectedDoctor || !this.selectedBranch) return;

  const selectedDate = event.value;
  //existing appointments for this date
  this.fetchExistingAppointments(selectedDate, this.selectedDoctor.name);
  this.startPolling();

}

private timeToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

private minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60) % 24;
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

generateTimeSlots(startTime: string, endTime: string): TimeSlot[] {
  const slots: TimeSlot[] = [];
  const startMinutes = this.timeToMinutes(startTime);
  let endMinutes = this.timeToMinutes(endTime);
  
  if (endMinutes <= startMinutes) {
    endMinutes += 24 * 60;
  }
  
  for (let i = 0; i <= endMinutes - startMinutes; i += 30) {
    const slotMinutes = (startMinutes + i) % (24 * 60);
    slots.push({
      time: this.minutesToTime(slotMinutes),
      isSelected: false,
      isDisabled: false // Will be updated by updateTimeSlotsAvailability
    });
  }
  
  return slots;
}

private updateTimeSlotsAvailability() {
  this.timeSlots = this.timeSlots.map(slot => {
    const isTimeSlotTaken = this.existingAppointments.some(apt => {
      const appointmentTime = this.extractTimeFromDateTime(apt.time);
      return appointmentTime === slot.time;
    });

    return {
      ...slot,
      isDisabled: isTimeSlotTaken
    };
  });
}

private extractTimeFromDateTime(dateTime: string): string {

  const timeMatch = dateTime.match(/\d{2}:\d{2}/);
  return timeMatch ? timeMatch[0] : '';
}

onTimeSelect(selectedTime: string) {
  // allow selection if the time slot is not disabled
  const slot = this.timeSlots.find(s => s.time === selectedTime);
  if (slot && !slot.isDisabled) {
    this.timeSlots = this.timeSlots.map(slot => ({
      ...slot,
      isSelected: slot.time === selectedTime
    }));
    this.appointmentForm.patchValue({ time: selectedTime });
  }
}

getTimeSlotClasses(slot: TimeSlot): string {
  if (slot.isDisabled) {
    return 'btn w-100 rounded-pill btn-secondary disabled';
  }
  return `
    btn 
    w-100 
    rounded-pill 
    ${slot.isSelected ? 'btn-primary' : 'btn-outline-primary'}
  `;
}

onSubmit(patientId:number) {
  console.log(patientId);
  const patient=this.patientData.find(p=>p.patientId===patientId)

  if (this.appointmentForm.valid && patient) {
    const selectedDate = this.appointmentForm.get('date')?.value as Date;
    const timeValue = this.appointmentForm.get('time')?.value;
    
    // Combine the selected date and time
    const combinedDateTime = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate(),
      parseInt(timeValue.split(':')[0]),
      parseInt(timeValue.split(':')[1])
    );

    // Format the date and time in the local timezone
    const formattedDate = combinedDateTime.toLocaleDateString('en-CA'); 
    const formattedTime = combinedDateTime.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' }); // 'en-GB' uses 24-hour format

    const appointment = {
      cost: 0,
      time: `${formattedTime}.0000000`,
      date: `${formattedDate}T00:00:00.000Z`, // Use the formatted date, but keep the time at midnight
      reports: '',
      type: this.appointmentForm.get('type')?.value,
      doctorName: this.selectedDoctor?.name,
        patientName: patient.name,
        patientPhoneNumber:patient.phoneNumber,
        patientAge:patient.age,
        patientGender:patient.gender,
        status:"0",
        patientId: patient.patientId
    };

    console.log('Appointment object being sent to the API:', appointment);

    this.http.post('http://localhost:37439/api/Appoinment', appointment).subscribe(
      (response) => {
        this.updateTimeSlotsAvailability();
        this.showSuccessModal = true;  // Update time slots after booking
        this.appointmentForm.reset();
        this.selectedDoctor = null;
        this.selectedBranch = null;
        this.timeSlots = [];
        this.error = null;
        setTimeout(() => {
          location.reload();
        }, 2000);
      },
      (error) => {
        this.error = 'فشل في حجز الموعد. يرجى المحاولة مرة أخرى.';
        console.error('Error booking appointment:', error);
      }
    );
  } else {
    this.error = this.currentPatient ? 'يرجى إكمال جميع الحقول المطلوبة' : 'معلومات المريض غير متوفرة';
  }
}



}

