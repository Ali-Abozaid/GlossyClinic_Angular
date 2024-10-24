import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BookDashboardService } from '../../shared/services/book-dashboard.service';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';


@Component({
  selector: 'app-book-dashboard',
  standalone: true,
  imports: [CommonModule,FormsModule,ReactiveFormsModule,MatDatepickerModule,MatFormFieldModule,MatInputModule,MatNativeDateModule],
  templateUrl: './book-dashboard.component.html',
  styleUrl: './book-dashboard.component.css'
})
export class BookDashboardComponent implements OnInit {
  doctors: any[] = [];
  branches: any[] = [];
  DoctorBranch:any[] = [];
  availableDates:any[]=[];
  avaiableTimes:any[]=[]
  selectedDayName: string | null = null;
  timeSlots:any[]=[];
  DataAppoinment:any[]=[];
  userData: any;
  isLoading:boolean=false;
  PatientForm!: FormGroup;
  loading = false;
  error = '';
  successMessage = '';
  isPatientRegistered: boolean = false; // New state variable to track registration status
  PatientId:number|null=null;
  displayStyle="none";
  shouldNavigateAfterClose = false;
  





  constructor(
    private formBuilder: FormBuilder,
    private _BookDashboard: BookDashboardService
  ) { }

  bookForm:FormGroup=new FormGroup({
    doctorName:new FormControl('',[Validators.required]),
    branchName:new FormControl('',[Validators.required]),
    VisitType:new FormControl('',[Validators.required]),
    DateVisit:new FormControl('',[Validators.required]),
    TimeVisit:new FormControl('',[Validators.required])
  })
  
  ngOnInit() {
    this.PatientForm = this.formBuilder.group({
      name: ['', [
        Validators.required,
        Validators.pattern('^[a-zA-Z\u0600-\u06FF ]+$')
      ]],
      age:['',[Validators.required,Validators.min(1)]],
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
    },);
    this.loadData();
    this.onDoctorOrBranchChange();
    this.onDateChange();

  }

  onSubmit() {
    if (this.PatientForm.invalid) {
      return;
    }
    this.loading = true;
    console.log(this.PatientForm.value);
    
    this._BookDashboard.postPatient(this.PatientForm.value).subscribe({
      next: (response) => {
       
        this.PatientId=response.patientId;
        response.PatientId
        this.loading = false;
        this.successMessage = 'تم التسجيل بنجاح';
        this.isPatientRegistered = true;
      },
      error: (err) => {
        this.loading = false;
      }
    });
  }


  loadData(): void {
    this._BookDashboard.getDoctor().subscribe({
      next:(data)=>{
        this.doctors=data;
      }
    });

    this._BookDashboard.getbranchs().subscribe({
      next:(data)=>{
        this.branches=data
      }
    })

    this._BookDashboard.getDoctorBranch().subscribe({
      next:(data)=>{
        this.DoctorBranch=data;
      }
    })
    this._BookDashboard.getAppoinments().subscribe({
      next:(data)=>{
        this.DataAppoinment=data;
      }
    })

  }

  onDoctorOrBranchChange() {
    this.bookForm.get('doctorName')?.valueChanges.subscribe(() => this.filterAvailableDates());
    this.bookForm.get('branchName')?.valueChanges.subscribe(() => this.filterAvailableDates());
  }

  filterAvailableDates():any {
    const doctor = this.bookForm.get('doctorName')?.value;
    const branch = this.bookForm.get('branchName')?.value;

    if (doctor && branch) {
      this.availableDates= this.DoctorBranch
        .filter(item => item.doctorName === doctor && item.branchName === branch && item.isWork)
        .map(item => item.day.toLowerCase());
    } else {
      this.availableDates = [];
    }
    
  }
  
  filterDates = (date: Date | null): boolean => {    
    if (!date) {      
      return false;
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day for accurate comparison

    // Check if the date is in the past
    if (date < today) {
      return false;
    }

    let dayName = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();

    return this.availableDates.includes(dayName);
  };

  onDateChange() {
    this.bookForm.get('DateVisit')?.valueChanges.subscribe(() => this.filterAvailableTimes());
  }

  filterAvailableTimes(): void {
    const doctor = this.bookForm.get('doctorName')?.value;
    const branch = this.bookForm.get('branchName')?.value;
    const selectedDate = this.bookForm.get('DateVisit')?.value;
    if (doctor && branch && selectedDate) {
      const selectedDay = new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
      this.avaiableTimes = this.DoctorBranch
        .filter(item => item.doctorName === doctor && item.branchName === branch && item.day.toLowerCase() === selectedDay && item.isWork)
        .map(item => [item.startTime,item.endTime]) 
        .flat(); 
        this.timeSlots=this.generateTimeSlots(this.avaiableTimes);
        this.removeBookedTimeSlots(selectedDate, doctor);

    } else {
      this.avaiableTimes = [];
    }
  }

  generateTimeSlots(availableTimes: string[]): string[] {
    const [startTime, endTime] = availableTimes;
    const times: string[] = [];
    let currentTime = new Date(`1970-01-01T${startTime}`);
    let endTimeDate = new Date(`1970-01-01T${endTime}`);
  
    if (endTimeDate <= currentTime) {
      endTimeDate.setDate(endTimeDate.getDate() + 1); // Move the end time to the next day
    }
  
    while (currentTime <= endTimeDate) {
      const hours = currentTime.getHours();
      const minutes = currentTime.getMinutes().toString().padStart(2, '0');
      const period = hours >= 12 ? 'PM' : 'AM';
  
      const formattedHour = hours % 12 === 0 ? 12 : hours % 12; // Convert to 12-hour format
      times.push(`${formattedHour}:${minutes} ${period}`);
      currentTime.setMinutes(currentTime.getMinutes() + 30); // Increment by 30 minutes
    }  
    return times;
  }


// New function to remove booked time slots
removeBookedTimeSlots(selectedDate: string, doctor: string): void {
  const bookedAppointments = this.getBookedAppointments(selectedDate, doctor);

  // Filter out the booked time slots from the available time slots
  this.timeSlots = this.timeSlots.filter(timeSlot => 
    !bookedAppointments.includes(timeSlot)
  );
}

// Helper function to retrieve booked appointments
getBookedAppointments(selectedDate: string, doctor: string): string[] {
  return this.DataAppoinment
    .filter(appointment => 
      appointment.doctorName === doctor && 
      new Date(appointment.date).toDateString() === new Date(selectedDate).toDateString()
    )
    .map(appointment => this.convertTo12HourFormat(appointment.time));
}

convertTo12HourFormat(time: string): string {
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const formattedHour = hours % 12 === 0 ? 12 : hours % 12;
  return `${formattedHour}:${minutes.toString().padStart(2, '0')} ${period}`;
}



handelBook(){
  if (this.bookForm.valid) {
    const selectedDate = this.bookForm.get('DateVisit')?.value as Date;
    const timeValue = this.bookForm.get('TimeVisit')?.value;
    
    // Combine the selected date and time
    const combinedDateTime = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate(),
      parseInt(timeValue.split(':')[0]),
      parseInt(timeValue.split(':')[1])
    );

    // Format the date and time in the local timezone
    const formattedDate = combinedDateTime.toLocaleDateString('en-CA'); // 'en-CA' uses YYYY-MM-DD format
    const formattedTime = combinedDateTime.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' }); // 'en-GB' uses 24-hour format
    const appointment = {
      cost: 0,
      time: `${formattedTime}.0000000`,
      date: `${formattedDate}T00:00:00.000Z`, // Use the formatted date, but keep the time at midnight
      reports: '',
      patientId: this.PatientId,
      type: this.bookForm.get('VisitType')?.value,
      doctorName: this.bookForm.get('doctorName')?.value,
      patientName: this.PatientForm.get('name')?.value,
      patientPhoneNumber:this.PatientForm.get('phoneNumber')?.value,
      patientAge:this.PatientForm.get('age')?.value,
      patientGender:this.PatientForm.get('gender')?.value
    };
    console.log(appointment);
    
    this._BookDashboard.postDataAppoinment(appointment).subscribe({
      next:(response)=>{
        this.openPopup();
        this.shouldNavigateAfterClose = true;
        this.bookForm.reset();
        this.avaiableTimes = [];
      }
    })

}
}

openPopup() { 
  this.displayStyle = "block"; 
} 

  
closePopup(): void {
  this.displayStyle = 'none';
  if (this.shouldNavigateAfterClose) {
    this.shouldNavigateAfterClose = false;
    location.reload();
    // Reset the flag after navigation
  }
}















}
