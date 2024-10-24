import { CommonModule, DOCUMENT } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { Subject, debounceTime, distinctUntilChanged, map,Observable, forkJoin } from 'rxjs';
import { ExcelService } from '../../Services/excel.service';


interface AppointmentDto {
  appointmentId: number;
  cost: number;
  time: string;
  date: string;
  reports: string;
  type: number;
  patientAge: number;
  doctorName: string;
  patientName: string;
  status: number;
  email: string;
  mobile: string;
  branch?: string;
}

interface PatientDto {
  patientId: number;
  name: string;
  gender: number;
  phoneNumber: string;

}
interface PatientHistory {
  address: string;
  diabetes: boolean;
  gender: number;
  heartDiseases: boolean;
  hypertension: boolean;
  isBreastfeeding: boolean;
  isPregnant: boolean;
  isSmoking: boolean;
  kidneyDiseases: boolean;
  name: string;
  patientId: number;
  periodontalDisease: boolean;
  phoneNumber: string;
  stomachAche: boolean;
}
interface AppointmentWithPatientDetails extends AppointmentDto {
  patientId?: number;
  doctorId?: number;
  patientGender?: string;
  patientEmail?: string;
  patientPhoneNumber?: string;
  typeDescription?: string;
  StatusDescription?: string;
  formattedTime?: string;
  dateObj?: Date;
  branch: string;
}

interface BranchOption {
  value: string;
  label: string;
}
interface Doctor {
  doctorId: number;
  name: string;
  userId: string;
  phoneNumber: string;
  email: string;
}
interface Branch {
  branchId: number;
  location: string;
  branchName: string;
  userId: string;
}
@Component({
  selector: 'app-appoinment-dashboard',
  standalone: true,
  imports: [CommonModule,FormsModule,MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatNativeDateModule
],
providers: [ExcelService],
  templateUrl: './appoinment-dashboard.component.html',
  styleUrl: './appoinment-dashboard.component.css'
})
export class AppoinmentDashboardComponent implements OnInit {
  appointments: AppointmentWithPatientDetails[] = [];
  filteredAppointments: AppointmentWithPatientDetails[] = [];
  pageSize = 10;
  currentPage = 1;
  totalItems = 0;
  searchTerm = '';
  phoneSearchTerm = '';
  searchSubject = new Subject<string>();
  phonesearchSubject = new Subject<string>();
  selectedBranch: string = '';
  branchOptions: BranchOption[] = [
    { value: '', label: 'كل الفروع' },
    { value: 'branch1', label: 'فرع القوصية' },
    { value: 'branch2', label: 'فرع ابنوب' }
  ];
  selectedStatus: string = '';
  statusOptions: BranchOption[] = [
    { value: '', label: 'كل الحالات' },
    { value: '0', label: 'قادم' },
    { value: '1', label: 'تم الحضور' }
  ];
  AppointmentWithGender: any;
  selectedAppointment: AppointmentWithPatientDetails | null = null;
  patientHistory: PatientHistory | null = null;
  selectedDate: Date | null = null;
  private currentDoctorId: number | null = null;
  private doctors: Doctor[] = [];
  private currentUserId: string | null = null;
  private userBranch: Branch | null = null;
  isSecretary: boolean = false;
  showSuccessModal: boolean = false;
  showConfirmModal = false;
  showSuccessModalafterdelete = false;
  appointmentToDelete: AppointmentWithPatientDetails | null = null;

  constructor(private http: HttpClient,
    private excelExportService: ExcelService,
    @Inject(DOCUMENT) private document: Document

  ) {
    this.getCurrentUser();
  }

  ngOnInit() {
    this.loadAppointmentsAndPatients();
    this.setupSearch();
  }

  private getCurrentUser() {
    const token = this.document.defaultView?.localStorage?.getItem('eToken') ?? null;
    if (token) {
      try {
        const tokenPayload = JSON.parse(atob(token.split('.')[1]));
        this.currentUserId = tokenPayload.nameidentifier;
  
        //check if the user is a doctor
        this.http.get<Doctor[]>('http://localhost:5275/api/Doctor').subscribe(
          doctors => {
            const doctor = doctors.find(d => d.userId === this.currentUserId);
            if (doctor) {
              this.currentDoctorId = doctor.doctorId;
              this.isSecretary = false;
            } else {
              //check if they're a secretary
              this.http.get<Branch[]>('http://localhost:5275/api/Branch').subscribe(
                branches => {
                  const branch = branches.find(b => b.userId === this.currentUserId);
                  console.log(branch);
                  
                  if (branch) {
                    this.userBranch = branch;
                    this.isSecretary = true;
                  }
                  this.loadAppointmentsAndPatients();
                },
                error => console.error('Error fetching branch information:', error)
              );
            }
            this.loadAppointmentsAndPatients();
          },
          error => console.error('Error fetching doctor information:', error)
        );
      } catch (error) {
        console.error('Error decoding token:', error);
        this.loadAppointmentsAndPatients();
      }
    } else {
      this.loadAppointmentsAndPatients();
    }
  }
  exportToExcel(): void {
    let dataToExport = this.appointments;
    
    if (this.selectedBranch) {
      dataToExport = dataToExport.filter(app => app.branch === this.selectedBranch);
    }
    
    const preparedData = this.excelExportService.prepareAppointmentData(dataToExport);
    
    const fileName = this.selectedBranch 
      ? `Appointments_${this.selectedBranch}_${new Date().toISOString().split('T')[0]}`
      : `All_Appointments_${new Date().toISOString().split('T')[0]}`;
    
    this.excelExportService.exportToExcel(preparedData, fileName);
  }
  getDayName(dateString: string): string {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = { weekday: 'long' };
    return date.toLocaleDateString('en-US', options);
  }

  async getAppointmentBranch(doctorName: string, appointmentDate: string): Promise<string> {
    const dayName = this.getDayName(appointmentDate).toLowerCase();
    try {
      const response = await this.http.get<{ branchName: string }>(`http://localhost:5275/api/DoctorWorkBranch/${doctorName},${dayName}`).toPromise();
      return response?.branchName|| '';
    } catch (error) {
      console.error('Error fetching branch:', error);
      return '';
    }
  }
  
  loadAppointmentsAndPatients() {
    forkJoin({
      appointments: this.http.get<AppointmentDto[]>('http://localhost:5275/api/Appoinment'),
      patients: this.http.get<PatientDto[]>('http://localhost:5275/api/Patient/GetAllPatientsWithHistory')
    }).pipe(
      map(({ appointments, patients }) => {
        const patientMap = new Map(patients.map(p => [p.name.toLowerCase(), p]));
        
        return Promise.all(appointments.map(async appointment => {
          const patient = patientMap.get(appointment.patientName.toLowerCase());
          const formattedTime = appointment.time.split('.')[0];
          const branch = await this.getAppointmentBranch(appointment.doctorName, appointment.date);
          
          return {
            ...appointment,
            patientGender: this.interpretGender(patient?.gender),
            patientPhoneNumber: patient?.phoneNumber,
            typeDescription: this.mapAppointmentType(appointment.type),
            StatusDescription: this.mapAppointmentStatus(appointment.status),
            formattedTime: formattedTime.substring(0, 5),
            dateObj: new Date(appointment.date),
            branch: branch,
            patientId: patient?.patientId,
          };
        }));
      })
    ).subscribe(
      async (enrichedAppointments) => {
        this.appointments = (await enrichedAppointments).sort((a, b) => 
          a.dateObj!.getTime() - b.dateObj!.getTime()
        );
  

        if (this.isSecretary && this.userBranch) {
          this.appointments = this.appointments.filter(app => app.branch === this.userBranch!.branchName);
          console.log(this.userBranch.branchName);
          console.log(this.appointments);
          
        } else if (this.currentDoctorId !== null) {
          this.appointments = this.appointments.filter(app => app.doctorId === this.currentDoctorId);
        }
  
        this.totalItems = this.appointments.length;
        this.filterAppointments();
      },
      (error: any) => console.error('Error fetching data:', error)
    );
  }
  getBranchLabel(branchValue: string): string {
    const branch = this.branchOptions.find(option => option.value === branchValue);
    return branch ? branch.label : 'Unknown Branch'; 
  }
  interpretGender(genderBit: number | undefined): string {
    if (genderBit === undefined) return 'unknown';
    return genderBit === 0 ? 'male' : 'female';
  }

  mapAppointmentType(type: number): string {
    switch (type) {
      case 0:
        return 'كشف'; 
      case 1:
        return ' اعادة كشف'; 
      case 2:
        return 'تجميل'; 
      case 3:
        return 'زراعه';
      case 4:
        return 'علاج الجذور وحشو العصب';
      case 5:
        return 'حشو عادي';
      case 6:
        return 'تقويم';
      case 7:
        return 'امراض و تجميل اللثه';
      case 8:
        return 'جراحه الوجه و الفكين';
      case 9:
        return 'معمل الاسنان';
      default:
        return 'غير معروف'; 
    }
  }
  mapAppointmentStatus(Status:number): string {
    switch (Status) {
      case 0:
        return 'قادم'; 
      case 1:
        return ' تم الحضور';
      default:
      return 'غير معروف'; 
  }
}
  openEditModal(appointment: AppointmentWithPatientDetails) {
    this.selectedAppointment = { ...appointment };
    if (appointment.patientId) {  
      this.loadPatientHistory(appointment.patientId);
      console.log('PatientId:', appointment.patientId);
    } else {
      console.log('PatientId not found for patient:', appointment.patientName);
    }
  }

  loadPatientHistory(patientId: number) {
    console.log('Loading history for PatientId:', patientId);
    this.http.get<PatientHistory[]>('http://localhost:5275/api/Patient/GetAllPatientsWithHistory')
      .subscribe(
        (patients: PatientHistory[]) => {
          this.patientHistory = patients.find(p => p.patientId === patientId) || null;
          console.log('Patient history loaded:', this.patientHistory);
        },
        (error) => {
          console.error('Error fetching patient history:', error);
        }
      );
  }

  closeModal() {
    this.selectedAppointment = null;
  }

  saveAppointment() {
    console.log(this.selectedAppointment)
    if (this.selectedAppointment) {
      const updatedAppointment = {
        appointmentId: this.selectedAppointment.appointmentId,
      cost: this.selectedAppointment.cost, // Convert to string
      time: this.selectedAppointment.time.split('.')[0], // Remove milliseconds
      date: this.selectedAppointment.date.split('T')[0], // Keep only the date part
      reports: this.selectedAppointment.reports,
      type: this.selectedAppointment.type,
      doctorName: this.selectedAppointment.doctorName,
      patientName: this.selectedAppointment.patientName,
      patientPhoneNumber: this.selectedAppointment.patientPhoneNumber,
      patientAge: this.selectedAppointment.patientAge, // Convert to string
      patientId: this.selectedAppointment.patientId,
      status: this.selectedAppointment.status
      };

      this.http.put(`http://localhost:5275/api/Appoinment/${this.selectedAppointment.appointmentId}`, updatedAppointment)
        .subscribe(
          () => {
            const index = this.appointments.findIndex(a => a.appointmentId === this.selectedAppointment!.appointmentId);
            if (index !== -1) {
              this.appointments[index] = { ...this.appointments[index], ...updatedAppointment };
            }
            this.filterAppointments();
            this.showSuccessModal = true;
            this.closeModal();

            setTimeout(() => {
              window.location.reload();
            }, 2000)
          },
          (error) => {
            console.error('Error updating appointment', error);
          }
        );
    }
  }
  
  deleteAppointment(appointment: AppointmentWithPatientDetails) {
    this.appointmentToDelete = appointment;
    this.showConfirmModal = true;
  }

  confirmDelete() {
    if (this.appointmentToDelete) {
      this.http.delete(`http://localhost:5275/api/Appoinment/${this.appointmentToDelete.appointmentId}`)
        .subscribe({
          next: (response) => {
            this.loadAppointmentsAndPatients();
            this.showConfirmModal = false;
            this.showSuccessModalafterdelete = true;
            setTimeout(() => {
              this.showSuccessModalafterdelete = false;
              window.location.reload();
            }, 2500);
          },
          error: (error) => {
            console.error('Error deleting appointment:', error);
            alert('حدث خطأ أثناء حذف الموعد');
            this.showConfirmModal = false;
          }
        });
    }
  }
  setupSearch() {

    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(() => {
      this.currentPage = 1;
      this.filterAppointments();
    });
  

    this.phonesearchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(() => {
      this.currentPage = 1;
      this.filterAppointments();
    });
  }

  onSearch(event: any) {
    this.searchTerm = event.target.value;
    this.searchSubject.next(this.searchTerm);
  }
  
  onPhoneSearch(event: any) {
    this.phoneSearchTerm = event.target.value;
    this.phonesearchSubject.next(this.phoneSearchTerm);
  }
  onBranchChange() {
    this.filterAppointments();
  }

  onDateChange() {
    this.filterAppointments();
  }

  isSameDate(date1: Date, date2: Date): boolean {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  }

  filterAppointments() {
  this.filteredAppointments = this.appointments.filter(appointment => {
    const matchesName = this.searchTerm ? appointment.patientName.toLowerCase().includes(this.searchTerm.toLowerCase()) : true;
    const matchesPhone = this.phoneSearchTerm ? appointment.patientPhoneNumber?.toLowerCase().includes(this.phoneSearchTerm.toLowerCase()) : true;
    const matchesBranch = this.selectedBranch === '' || appointment.branch === this.selectedBranch;
    const matchesDate = this.selectedDate ? this.isSameDate(new Date(appointment.date), this.selectedDate) : true;
    const matchesStatus = this.selectedStatus === '' || appointment.status.toString() === this.selectedStatus;

    return matchesName && matchesPhone && matchesBranch && matchesDate && matchesStatus;

  });
  this.totalItems = this.filteredAppointments.length;
  this.updatePage();
    console.log(this.filteredAppointments);
  }

  updatePage() {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.filteredAppointments = this.filteredAppointments.slice(startIndex, endIndex);
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.filterAppointments();
  }
  
  onStatusChange() {
    this.filterAppointments();
  }

  markAsAttended(event: any) {
    if (this.selectedAppointment) {
      this.selectedAppointment.status = event.target.checked ? 1 : 0;
    }
  }

  onItemsPerPageChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.pageSize = parseInt(target.value, 10);
    this.currentPage = 1;
    this.filterAppointments();
  } 
  getPatientImage(gender: string | undefined): string {
    if (!gender) {
      return 'Images/default.png';
    }
    switch (gender.toLowerCase()) {
      case 'male':
        return 'Images/male.png';
      case 'female':
        return 'Images/female.png';
      default:
        return 'Images/default.png';
    }
  }
  closeSuccessModal() {
    this.showSuccessModal = false;
    location.reload();
  }
  
  closeSuccessModalDelete() {
    this.showSuccessModalafterdelete = false;
    location.reload();
  }
  cancelDelete() {
    this.showConfirmModal = false;
  }

}

