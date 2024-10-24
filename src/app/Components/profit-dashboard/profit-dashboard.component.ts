import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { map, tap } from 'rxjs/operators';
import * as XLSX from 'xlsx'; 
import { AuthService } from '../../shared/services/auth.service';



interface AppointmentDTO {
  appointmentId: number;
  cost: number;
  date: string;
  doctorId : number;
}

interface OutgoingDTO {
  outgoingsId: number;
  cost: number;
  date: string;
  nameOfOutgoings: string;
  branchName: string;
  doctorName: string;
  doctorId: number;
  branchID: number;
}

@Component({
  selector: 'app-profit-dashboard',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './profit-dashboard.component.html',
  styleUrl: './profit-dashboard.component.css'
})
export class ProfitDashboardComponent implements OnInit {
  userId: string = '';
  public financialData: any[] = [];
  public totalProfit = 0;
  public totalOutgoing = 0;
  public months: string[] = [
    'يناير',
    'فبراير',
    'مارس',
    'ابريل',
    'مايو',
    'يونيو',
    'يوليو',
    'اغسطس',
    'سبتمبر',
    'اكتوبر',
    'نوفمبر',
    'ديسمبر',
  ];

  filteredBranches: { id: number; name: string }[] = []; // متغير لتخزين الفروع بعد الفلترة

  public availableYears: number[] = [];
  public selectedYear: number = new Date().getFullYear();
  public showModal: boolean = false;
  public isAddingNewOutgoing: boolean = false;
  public noDataMessage: string | null = null;
  errorMessage: string = '';
  BranchID: Number = 0;
  appointments: AppointmentDTO[] = [];
  profits:OutgoingDTO[] = [];
  branchIdRole:number=0;

  public selectedOutgoings: OutgoingDTO[] = [];
  public selectedMonth: string | null = null;

  public newOutgoing: OutgoingDTO = {
    outgoingsId: 0,
    cost: 0,
    date: '',
    nameOfOutgoings: '',
    branchName: '',
    doctorName: '',
    doctorId: 0,
    branchID: 0,
  };
  DoctorIdRole: number=0;
  doctors = [
    { id: 1, name: 'د.مقار ماجد' },
    { id: 2, name: 'د.مينا يسري' },
  ];

  branches = [
    { id: 3, name: 'القوصية' },
    { id:4, name: 'ابنوب' },
  ];


  onDoctorChange(event: Event): void {
    const selectedDoctorId = (event.target as HTMLSelectElement).value;
    const doctorId = parseInt(selectedDoctorId, 10);

    if (doctorId === 1) {
      this.newOutgoing.doctorName = 'د.مقار ماجد';
      this.newOutgoing.doctorId = 1;
    } else if (doctorId === 2) {
      this.newOutgoing.doctorName = 'د.مينا يسري';
      this.newOutgoing.doctorId = 2;
    }
  }

  onBranchChange(event: Event): void {
    const selectedBranchId = (event.target as HTMLSelectElement).value;
    const branchId = parseInt(selectedBranchId, 10);


    if (branchId === 3) {
      this.newOutgoing.branchName = 'القوصية';
      this.newOutgoing.branchID = 3;
    } else if (branchId === 4) {
      this.newOutgoing.branchName = 'ابنوب';
      this.newOutgoing.branchID = 4;
    }
  }

  private appointmentsUrl = 'http://localhost:5275/api/Appoinment';
  private outgoingsUrl = 'http://localhost:5275/api/outgoings';

constructor(private http: HttpClient, private authservice: AuthService) {}

  ngOnInit(): void {
    const token = this.authservice.getUserData();
    this.userId = token.nameidentifier;
    console.log("loged user:", this.userId);
    this.getDoctorIdByUserId(this.userId);
    this.getBranchIdByUserId(this.userId);
    this.loadFinancialData();
    this.initializeAvailableYears();



  }
  initializeAvailableYears() {
    this.http.get<any[]>('http://localhost:5275/api/outgoings').subscribe(
      (outgoings: any[]) => {

        this.availableYears = Array.from(
          new Set(outgoings.map(outgoing => new Date(outgoing.date).getFullYear()))
        );
      },
      (error) => {
        console.error('Error fetching outgoings data:', error);
      }
    );
  }
  getDoctorIdByUserId(userId: string): void {
    this.http.get<any[]>('http://localhost:5275/api/Doctor').subscribe({
      next: (doctors) => {
        const doctor = doctors.find(d => d.userId === userId);
        if (doctor) {
          this.DoctorIdRole = doctor.doctorId;
          console.log("doctorID:", this.DoctorIdRole);
          this.loadFinancialData();

        } else {
          console.log('Doctor not found');
        }
      },
      error: (error) => {
        console.error('Error fetching doctor data', error);
      }
    });
  }
  getBranchIdByUserId(userId: string): Promise<number> {
    return new Promise((resolve, reject) => {
        this.http.get<any[]>('http://localhost:5275/api/Branch').subscribe({
            next: (branches) => {
                console.log(branches);
                branches.forEach((branch) => {
                    console.log(
                        `Branch UserID: "${branch.userId}", Passed UserID: "${userId}"`
                    );
                });
                const branch = branches.find((b) => b.userId === userId);
                if (branch) {
                    console.log('Branch ID:', branch.branchId);
                    resolve(branch.branchId);

                } else {
                    console.log('Branch not found');
                    resolve(-1);
                }
            },
            error: (error) => {
                console.error('Error fetching Branch data', error);
                reject(error);
            },
        });
    });
}
  getOutgoings(): Observable<OutgoingDTO[]> {
    return this.http.get<OutgoingDTO[]>('http://localhost:5275/api/outgoings');
  }
  getAppointments(): Observable<AppointmentDTO[]> {
    return this.http.get<AppointmentDTO[]>('http://localhost:5275/api/Appoinment');
  }
getDayName(date: Date): string {
  const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'Thursday', 'Friday'];
  return daysOfWeek[date.getDay()];
}


getBranchIdByDoctorIdAndDay(doctorId: number, date: Date): void {
  const dayName = this.getDayName(date);

  this.http.get<any[]>(`http://localhost:5275/api/DoctorWorkBranch`).subscribe({
      next: (doctorWorkBranches) => {
        console.log('aaaaa',doctorWorkBranches)
          const doctorWorkBranch = doctorWorkBranches.find(branch =>
              branch.doctorId === doctorId && branch.day === dayName
          );
          if (doctorWorkBranch) {
              console.log('Branch ID:', doctorWorkBranch.branshId);
          } else {
              console.log('No branch found for this doctor on this day');
          }
      },
      error: (error) => {
          console.error('Error fetching DoctorWorkBranch data', error);
      }
  });
}
async isDoctorInBranchOnDay(doctorId: number, branchId: number, dayName: string): Promise<boolean> {
  try {
      const doctorWorkBranches = await this.http.get<any[]>(`http://localhost:5275/api/DoctorWorkBranch`).toPromise();

      if (!doctorWorkBranches) {
          console.error('No data returned from DoctorWorkBranch API');
          return false;
      }
      const doctorWorkBranch = doctorWorkBranches.find(branch =>
          branch.doctorId === doctorId && branch.branshId === branchId && branch.day === dayName
      );
      return !!doctorWorkBranch;
  } catch (error) {
      console.error('Error fetching DoctorWorkBranch data', error);
      return false;
  }
}
async filterAppointmentByDoctorAndDay(appointment: AppointmentDTO, branchId: number): Promise<boolean> {
  const doctorId = appointment.doctorId;
  const appointmentDate = new Date(appointment.date);
  const dayName = this.getDayName(appointmentDate);
  return await this.isDoctorInBranchOnDay(doctorId, branchId, dayName);
}

async loadFinancialData(): Promise<void> {
  const token = this.authservice.getUserData();
  const userRole = token.role;

  try {
    const appointments = await this.getAppointments().toPromise();
    const outgoings = await this.getOutgoings().toPromise();


    if (!appointments || !outgoings) {
      console.error('Error: Unable to fetch data.');
      return;
    }

    if (userRole === 'Secretary') {
      const branchId = await this.getBranchIdByUserId(token.nameidentifier);
      this.branchIdRole=branchId;
      if (branchId === -1) {
        console.error('Branch not found');
        return;
      }

      console.log('Branch ID found:', branchId);

      const filteredAppointments: AppointmentDTO[] = [];
      for (const appointment of appointments) {
        const isDoctorInBranch = await this.filterAppointmentByDoctorAndDay(appointment, branchId);
        if (isDoctorInBranch && new Date(appointment.date).getFullYear() === this.selectedYear) {
          filteredAppointments.push(appointment);
        }
      }
      console.log("aaaaaaa",filteredAppointments)

      const filteredOutgoings = outgoings.filter(
        (out) =>
          out.branchID === branchId &&
          new Date(out.date).getFullYear() === this.selectedYear
      );
      console.log("oooooooooo",filteredOutgoings)

      if (filteredAppointments.length === 0 && filteredOutgoings.length === 0) {
        this.noDataMessage = `لا توجد بيانات للفرع: ${branchId}`;
        this.financialData = [];
      } else {
        this.noDataMessage = null;
        this.calculateMonthlySums(filteredAppointments, filteredOutgoings);
      }
    }
    else if (userRole === 'Admin') {
      if (!this.DoctorIdRole) {
        console.error('No doctorId found');
        return;
      }

      const filteredAppointments = appointments.filter(
        (app) =>
          new Date(app.date).getFullYear() === this.selectedYear &&
          app.doctorId === this.DoctorIdRole
      );
      const filteredOutgoings = outgoings.filter(
        (out) =>
          new Date(out.date).getFullYear() === this.selectedYear &&
          out.doctorId === this.DoctorIdRole
      );

      if (filteredAppointments.length === 0 && filteredOutgoings.length === 0) {
        this.noDataMessage = `لا توجد بيانات للسنة المحددة : ${this.selectedYear}`;
        this.financialData = [];
      } else {
        this.noDataMessage = null;
        this.calculateMonthlySums(filteredAppointments, filteredOutgoings);
      }
    }
    else {
      console.error('User role not recognized');
    }
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}
calculateTotalProfits(appointments: AppointmentDTO[], profits: OutgoingDTO[]): void {
  let totalProfit = 0;
  appointments.forEach(app => {
    const relevantProfit = profits.find(profit => profit.doctorId === app.doctorId);
    if (relevantProfit) {
      totalProfit += relevantProfit.cost;
    }
  });
  this.totalProfit = totalProfit;
  console.log('Total Profit:', this.totalProfit);
}
  calculateMonthlySums(
    appointments: AppointmentDTO[],
    outgoings: OutgoingDTO[]
  ): void {
    const monthlyData = Array(12)
      .fill(null)
      .map(() => ({
        profit: 0,
        outgoing: 0,
        pureProfit: 0,
      }));
    this.totalProfit = 0;
    this.totalOutgoing = 0;
    appointments.forEach((app) => {
      const monthIndex = new Date(app.date).getMonth();
      monthlyData[monthIndex].profit += app.cost;
      this.totalProfit += app.cost;
    });
    outgoings.forEach((out) => {
      const monthIndex = new Date(out.date).getMonth();
      monthlyData[monthIndex].outgoing += out.cost;
      this.totalOutgoing += out.cost;
    });
    monthlyData.forEach((month) => {
      month.pureProfit = month.profit - month.outgoing;
    });
    const totalRow = {
      month: 'الاجمالي',
      profit: this.totalProfit,
      outgoing: this.totalOutgoing,
      pureProfit: this.totalProfit - this.totalOutgoing,
    };
    this.financialData = monthlyData.map((data, index) => ({
      month: this.months[index],
      profit: data.profit,
      outgoing: data.outgoing,
      pureProfit: data.pureProfit,
    }));
    this.financialData.push(totalRow);
  }
  showOutgoingDetails(monthIndex: number): void {
    const selectedMonthName = this.financialData[monthIndex].month;
    this.selectedMonth = selectedMonthName;
    const selectedMonthIndex = this.months.indexOf(selectedMonthName);

    this.getOutgoings().subscribe((outgoings) => {
      const selectedOutgoings = outgoings.filter((outgoing) => {
        const outgoingDate = new Date(outgoing.date);
        const outgoingYear = outgoingDate.getFullYear();
        const outgoingMonth = outgoingDate.getMonth();

        if (this.authservice.getUserData().role === 'Secretary') {
          // فلترة المصاريف بناءً على الفرع فقط
          return (
            outgoingYear === this.selectedYear &&
            outgoingMonth === selectedMonthIndex &&
            outgoing.branchID === this.branchIdRole // استخدم branchId هنا
          );
        } else {
          // فلترة المصاريف بناءً على doctorId للدكتور
          return (
            outgoingYear === this.selectedYear &&
            outgoingMonth === selectedMonthIndex &&
            outgoing.doctorId === this.DoctorIdRole
          );
        }
      });

      if (selectedOutgoings.length === 0) {
        this.noDataMessage = `لا توجد تفاصيل للمصاريف لهذا الشهر في السنة المحددة: ${this.selectedYear}`;
      } else {
        this.selectedOutgoings = selectedOutgoings;
        this.showModal = true;
        this.isAddingNewOutgoing = false;
        this.noDataMessage = null;
      }
    });
  }
  closeModal(): void {
    this.showModal = false;
    this.resetNewOutgoing();
  }
  openAddOutgoingModal(): void {
    this.showModal = true;
    this.isAddingNewOutgoing = true;
    this.resetNewOutgoing();
  }
  submitNewOutgoing(): void {
    this.http.post<OutgoingDTO>(this.outgoingsUrl, this.newOutgoing).subscribe({
      next: (response) => {
        console.log('Outgoing added:', response);
        this.closeModal();
        this.loadFinancialData();
      },
      error: (err) => console.error('Error adding outgoing:', err),
    });
  }
  resetNewOutgoing(): void {
    this.newOutgoing = {
      outgoingsId: 0,
      cost: 0,
      date: '',
      nameOfOutgoings: '',
      branchName: '',
      doctorName: '',
      doctorId: 0,
      branchID: 0,
    };
  }
  downloadOutgoingDetails(monthIndex: number): void {
    const selectedOutgoings = this.selectedOutgoings.filter(
      out => new Date(out.date).getMonth() == monthIndex
    );

    if (selectedOutgoings.length == 0) {
      this.errorMessage = 'لا توجد تفاصيل للمصاريف المتاحة للشهر المحدد.';
      return;
    }

    const filteredOutgoings = selectedOutgoings.map(({ doctorId, branchID, ...rest }) => rest);

    const worksheet = XLSX.utils.json_to_sheet(filteredOutgoings);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Outgoing Details');

    const monthName = this.financialData[monthIndex].month;
    XLSX.writeFile(workbook, `Outgoing_Details_${monthName}.xlsx`);
    this.errorMessage = '';
}

  downloadAllData(): void {
    const worksheet = XLSX.utils.json_to_sheet(this.financialData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Financial Data');

    XLSX.writeFile(workbook, `Financial_Data_${this.selectedYear}.xlsx`);
  }

   filterBranches() {
    const token = this.authservice.getUserData();
    const userRole = token.role;
    if (userRole === 'Admin') {
      return this.branches;
    } else if (userRole === 'Secretary') {
      return this.branches.filter(b => b.id === this.branchIdRole);
    } else {
      return [];
    }
  }

  filterDoctors() {
    const token = this.authservice.getUserData();
    const userRole = token.role;
    if (userRole === 'Secretary') {
      return this.doctors;
    } else if (userRole === 'Admin') {
      return this.doctors.filter(b => b.id === this.DoctorIdRole);
    } else {
      return [];
    }
  }
}








