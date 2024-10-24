import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  Chart,
  registerables,
  ChartTypeRegistry,
  ChartOptions,
  ChartData,
} from 'chart.js';
import moment from 'moment';
import 'moment/locale/ar';
import { Subscription } from 'rxjs';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { AuthService } from '../../shared/services/auth.service';
interface AppointmentDto {
  appointmentId: number;
  cost: number;
  time: string;
  date: Date;
  reports: string;
  type: number;
  doctorName: string;
  patientName: string;
  patientPhoneNumber: string;
  patientGender: number;
  patientAge: number;
  patientId: number;
  doctorId : number;
}
@Component({
  selector: 'app-home-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './home-dashboard.component.html',
  styleUrls: ['./home-dashboard.component.css'],
})
export class HomeDashboardComponent implements OnInit {
  private costChart: Chart<'bar'> | null = null;
  private genderChart: Chart<'doughnut'> | null = null;
  private typeChart: Chart<'pie'> | null = null;
  private ageChart: Chart<'bar'> | null = null;

  todayAppointmentsCount: number = 0;
  appointments: AppointmentDto[] = [];
  filteredAppointments: AppointmentDto[] = [];
  totalAppointments: number = 0;
  totalCost: number = 0;
  searchPatientPhoneNumber: string = '';
  searchQuery: string = '';
  searchType: string = 'name';
  searchPatientName: string = '';
  selectedYear: number = new Date().getFullYear();
  selectedMonth: number = new Date().getMonth() + 1;
  years: number[] = [];
  months: { name: string; value: number }[] = [];
  private dataSubscription: Subscription | undefined;
  currentMonth!: string;
  totalProfits: number = 0;
  appointmentChart!: Chart;
  patientsMonthly: number[] = Array(12).fill(0);
  token:any;
  DoctorId: number = 0;
  userId: string = '';
  

  constructor(private http: HttpClient , private auth:AuthService) {
    Chart.register(...registerables);
  }
  ngOnInit(): void {
    const token = this.auth.getUserData();
    this.userId = token.nameidentifier;
    this.getDoctorIdByUserId(this.userId);
    this.getBranchIdByUserId(this.userId)
    this.getAppointmentsForDoctor();
    this.getAppointments();
    this.populateYears();
    this.populateMonths();
    moment.locale('ar');
    this.currentMonth = moment().format('MMMM');
    this.renderCharts();
    // this.fetchData();
  }

  populateYears(): void {
    const startYear = 2024;
    const futureYearsCount = 10;
    const endYear = startYear + futureYearsCount;
    for (let year = startYear; year <= endYear; year++) {
      this.years.push(year);
    }
  }
  populateMonths(): void {
    this.months = [
      { name: 'يناير', value: 1 },
      { name: 'فبراير', value: 2 },
      { name: 'مارس', value: 3 },
      { name: 'أبريل', value: 4 },
      { name: 'مايو', value: 5 },
      { name: 'يونيو', value: 6 },
      { name: 'يوليو', value: 7 },
      { name: 'أغسطس', value: 8 },
      { name: 'سبتمبر', value: 9 },
      { name: 'أكتوبر', value: 10 },
      { name: 'نوفمبر', value: 11 },
      { name: 'ديسمبر', value: 12 },
    ];
  }
  getBranchIdByUserId(userId: string): Promise<number> {
    return new Promise((resolve, reject) => {
      this.http.get<any[]>(`http://localhost:5275/api/Branch`).subscribe({
        next: (branches) => {

          const secretaryBranch = branches.find(branch => branch.userId === userId);
         if (secretaryBranch) {
          resolve(secretaryBranch.branchId);
        } else {
          reject('Branch not found');
        }
        },
        error: (error) => {
          console.error('Error fetching SecretaryBranch data', error);
          reject(error);
        }
      });
    });
  }
  getDoctorIdByUserId(userId: string): void {
    this.http.get<any[]>('http://localhost:5275/api/Doctor').subscribe({
      next: (doctors) => {
       
        const doctor = doctors.find(d => d.userId === userId);
        if (doctor) {
          this.DoctorId = doctor.doctorId; 
        } else {
          console.log('Doctor not found');
        }
      },
      error: (error) => {
        console.error('Error fetching doctor data', error);
      }
    });
  }

  async getAppointments(): Promise<void> {
    const token = this.auth.getUserData();
    const userRole = token.role;  
    
    if (userRole === 'Secretary') {
        const branchId = await this.getBranchIdByUserId(token.nameidentifier);
        
        this.http.get<AppointmentDto[]>('http://localhost:5275/api/Appoinment').subscribe({
            next: async (data) => {
                const today = new Date();
                const todayString = today.toLocaleDateString('en-CA');

                this.appointments = [];
                for (const appointment of data) {
                    const isDoctorInBranch = await this.filterAppointmentByDoctorAndDay(appointment, branchId);
                    if (isDoctorInBranch) {
                        this.appointments.push(appointment);
                    }
                }

                this.filteredAppointments = this.appointments.filter(appointment => {
                    const appointmentDate = new Date(appointment.date).toLocaleDateString('en-CA');
                    return appointmentDate === todayString;
                });

                this.totalAppointments = this.filteredAppointments.length;
                this.todayAppointmentsCount = this.totalAppointments;

                this.calculateMonthlyProfits(this.appointments);
                this.calculateTotalAppointments(this.appointments);
                this.calculateMonthlyPatients(this.appointments);
                this.generateChart();
                this.generateGenderChart();
                this.generateTypeChart();
                this.generateAgeChart();
                this.renderCharts();
            },
            error: (error) => {
                console.error('Error fetching appointments', error);
            }
        });
    } else {
        this.getAppointmentsForDoctor();
    }
}
  getAppointmentsForDoctor(): void {
    this.http.get<AppointmentDto[]>('http://localhost:5275/api/Appoinment').subscribe({
        next: (data) => {
            const today = new Date();
            const todayString = today.toLocaleDateString('en-CA');
  
            this.appointments = data.filter(appointment => appointment.doctorId === this.DoctorId);
            
            this.filteredAppointments = this.appointments.filter(appointment => {
                const appointmentDate = new Date(appointment.date).toLocaleDateString('en-CA');
                return appointmentDate === todayString;
            });
  
            this.totalAppointments = this.filteredAppointments.length;
            this.todayAppointmentsCount = this.totalAppointments;
  
           

            

            this.calculateMonthlyProfits(this.appointments);
            this.calculateTotalAppointments(this.appointments);
            this.calculateMonthlyPatients(this.appointments);
            this.generateChart(); 
            this.generateGenderChart();   
            this.generateTypeChart(); 
            this.generateAgeChart(); 
            this.renderCharts();
        },
        error: (error) => {
            console.error('Error fetching appointments', error);
        },
    });
}
async filterAppointmentByDoctorAndDay(appointment: AppointmentDto, branchId: number): Promise<boolean> {
  const doctorId = appointment.doctorId;
  const appointmentDate = new Date(appointment.date);
  
  const dayName = this.getDayName(appointmentDate);
  
  return await this.isDoctorInBranchOnDay(doctorId, branchId, dayName);
}
getDayName(date: Date): string {
  const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'Thursday', 'Friday'];
  return daysOfWeek[date.getDay()];
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
  formatTime(time: string): string {
    if (!time) return '';
    const [hours, minutes, seconds] = time.split(':');
    const formattedHours = +hours % 12 || 12;
    const period = +hours < 12 ? 'صباحا' : 'مساءا';
    const formattedMinutes = +minutes;
    const formattedSeconds = +seconds;
    return `${formattedHours}:${formattedMinutes}:${formattedSeconds} ${period}`;
  }
  filterAppointments(): void {
    const searchQuery = this.searchQuery.trim().toLowerCase();
    const searchType = this.searchType;
    this.filteredAppointments = this.appointments.filter((appointment) => {
      const appointmentDate = new Date(appointment.date).toLocaleDateString(
        'en-CA'
      );
      const todayString = new Date().toLocaleDateString('en-CA');
      const isTodayAppointment = appointmentDate === todayString;
      let matchesSearch = false;
      if (searchType === 'name') {
        matchesSearch = appointment.patientName
          .toLowerCase()
          .startsWith(searchQuery);
      } else if (searchType === 'phone') {
        matchesSearch = appointment.patientPhoneNumber.includes(searchQuery);
      }
      return isTodayAppointment && matchesSearch;
    });
    this.totalAppointments = this.filteredAppointments.length;
  }
  generateAgeChart(): void {
    const ageGroups = ['<20', '20-30', '31-40', '41-50', '51-60', '>60'];
    const ageDistribution = Array(ageGroups.length).fill(0);

    const uniquePatients = new Map<number, number>();
    this.appointments.forEach((appointment) => {
      if (!uniquePatients.has(appointment.patientId)) {
        uniquePatients.set(appointment.patientId, appointment.patientAge);
      }
    });
    uniquePatients.forEach((age) => {
      if (age < 20) {
        ageDistribution[0]++;
      } else if (age >= 20 && age <= 30) {
        ageDistribution[1]++;
      } else if (age >= 31 && age <= 40) {
        ageDistribution[2]++;
      } else if (age >= 41 && age <= 50) {
        ageDistribution[3]++;
      } else if (age >= 51 && age <= 60) {
        ageDistribution[4]++;
      } else {
        ageDistribution[5]++;
      }
    });
    this.displayAgeChart(ageGroups, ageDistribution);
  }

  displayAgeChart(labels: string[], data: number[]): void {
    if (typeof document !== 'undefined') {
      const ageChartCanvas = document.getElementById(
        'ageChart'
      ) as HTMLCanvasElement;
      if (this.ageChart) {
        this.ageChart.destroy();
      }
      this.ageChart = new Chart(ageChartCanvas, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [
            {
              label: 'عدد المرضى',
              data: data,
              backgroundColor: [
                '#FF6384',
                '#36A2EB',
                '#FFCE56',
                '#4BC0C0',
                '#9966FF',
                '#FF9F40',
              ],
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                precision: 0,
              },
            },
          },
        },
      });
    }
  }
  generateChart(): void {
    const startDate = new Date(this.selectedYear, this.selectedMonth - 1, 1);
    const endDate = new Date(this.selectedYear, this.selectedMonth, 0);
    const daysInMonth = endDate.getDate();

    const costs = Array(daysInMonth).fill(0);
    const dayLabels = Array.from({ length: daysInMonth }, (_, i) =>
      (i + 1).toString()
    );
    this.appointments.forEach((appointment) => {
      const appointmentDate = new Date(appointment.date);
      if (appointmentDate >= startDate && appointmentDate <= endDate) {
        const dayIndex = appointmentDate.getDate() - 1;
        costs[dayIndex] += appointment.cost;
      }
    });
    this.displayChart(dayLabels, costs);
  }
  displayChart(labels: string[], data: number[]): void {
    if (typeof document !== 'undefined') {
      const ctx = document.getElementById('costChart') as HTMLCanvasElement;
      if (this.costChart) {
        this.costChart.destroy();
      }
      if (ctx) {
        this.costChart = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: labels,
            datasets: [
              {
                label: 'تفاصيل الربح',
                data: data,
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
              },
            ],
          },
          options: {
            scales: {
              y: {
                beginAtZero: true,
              },
              x: {
                title: {
                  display: true,
                  text: 'أيام الشهر',
                },
              },
            },
          },
        });
      }
    }
  }

  generateGenderChart(): void {
    let maleCount = 0;
    let femaleCount = 0;

    this.appointments.forEach((appointment) => {
      if (appointment.patientGender === 0) {
        maleCount++;
      } else if (appointment.patientGender === 1) {
        femaleCount++;
      }
    });

    const genderData = [maleCount, femaleCount];
    const genderLabels = ['ذكر', 'انثى'];

    this.displayGenderChart(genderLabels, genderData);
  }

  displayGenderChart(labels: string[], data: number[]): void {
    if (typeof document !== 'undefined') {
      const ctx = document.getElementById('genderChart') as HTMLCanvasElement;

      if (this.genderChart) {
        this.genderChart.destroy();
      }

      if (ctx) {
        this.genderChart = new Chart<'doughnut', number[]>(ctx, {
          type: 'doughnut',
          data: {
            labels: labels,
            datasets: [
              {
                data: data,
                backgroundColor: ['#3498db', '#e74c3c'],
                hoverBackgroundColor: ['#2980b9', '#c0392b'],
              },
            ],
          },
          options: {
            responsive: true,
            plugins: {
              legend: {
                position: 'top',
              },
              tooltip: {
                callbacks: {
                  label: (tooltipItem) => {
                    return `${tooltipItem.label}: ${tooltipItem.raw}`;
                  },
                },
              },
              datalabels: {
                anchor: 'end',
                align: 'end',
                formatter: (value, context) => {
                  return value > 0 ? value : '';
                },
              },
            },
            cutout: '60%',
          },
        });
      }
    }
  }
  filterAppointmentsByMonth(): AppointmentDto[] {
    const filteredByMonth = this.appointments.filter((appointment) => {
      const appointmentDate = new Date(appointment.date);
      return (
        appointmentDate.getFullYear() === this.selectedYear &&
        appointmentDate.getMonth() + 1 === this.selectedMonth
      );
    });
    return filteredByMonth;
  }

  generateTypeChart(): void {
    const typeCounts = Array(10).fill(0);
  
    this.appointments.forEach((appointment) => {
      if (appointment.type >= 0 && appointment.type <= 9) {
        typeCounts[appointment.type]++;
      }
    });
  
    this.displayTypeChart(
      [
        'كشف',
        'اعادة',
        'تجميل',
        'زراعه',
        'علاج الجذور وحشو العصب',
        'حشو عادي',
        'تقويم',
        'امراض و تجميل اللثه',
        'جراحه الوجه و الفكين',
        'معمل الاسنان',
      ],
      typeCounts
    );
  }

  displayTypeChart(labels: string[], data: number[]): void {
    if (typeof document !== 'undefined') {
      const ctx = document.getElementById('typeChart') as HTMLCanvasElement;

      if (ctx) {
        if (this.typeChart) {
          this.typeChart.destroy();
        }

        this.typeChart = new Chart(ctx, {
          type: 'pie',
          data: {
            labels: labels,
            datasets: [
              {
                data: data,
                backgroundColor: [
                  '#FF6384',
                  '#36A2EB',
                  '#FFCE56',
                  '#4BC0C0',
                  '#9966FF',
                  '#FF9F40',
                  '#C9CBCF',
                  '#FF5A5E',
                  '#00C49F',
                  '#FFBB28',
                ],
              },
            ],
          },
          options: {
            responsive: true,
            plugins: {
              datalabels: {
                color: '#fff',
                display: true,
                formatter: (value, ctx) => {
                  let percentage =
                    ((value / this.totalAppointments) * 100).toFixed(2) + '%';
                  return `${percentage}`;
                },
              },
            },
          },
        });
      }
    }
  }
  calculateMonthlyProfits(data: any[]): void {
    const profitsMonthly = Array(12).fill(0);
    this.totalProfits = 0;

    data.forEach((appointment) => {
      const appointmentDate = moment(
        appointment.date,
        'YYYY-MM-DD HH:mm:ss.SSSSSSS'
      );
      const appointmentMonth = appointmentDate.month();

      const appointmentCost = parseFloat(appointment.cost);
      profitsMonthly[appointmentMonth] += appointmentCost;
    });

    const currentMonthNumber = moment().month();
    this.totalProfits = profitsMonthly[currentMonthNumber];
  }

  ngOnDestroy(): void {
    if (this.appointmentChart) {
      this.appointmentChart.destroy();
    }
    if (this.dataSubscription) {
      this.dataSubscription.unsubscribe();
    }
  }
  fetchData(): void {
    this.dataSubscription = this.http
      .get<any[]>('http://localhost:5275/api/Appoinment')
      .subscribe({
        next: (data) => {
          this.calculateMonthlyProfits(data);
          this.calculateTotalAppointments(data);
          this.calculateMonthlyPatients(data);
          this.renderCharts();
        },
        error: (error) => {
          console.error('Error fetching appointments', error);
        },
      });
  }

  calculateTotalAppointments(data: any[]): void {
    const currentMonthNumber = moment().month();
    this.totalAppointments = data.filter((appointment) => {
      const appointmentDate = moment(
        appointment.date,
        'YYYY-MM-DD HH:mm:ss.SSSSSSS'
      );
      return appointmentDate.month() === currentMonthNumber;
    }).length;
  }
  calculateMonthlyPatients(data: any[]): void {
    this.patientsMonthly = Array(12).fill(0);

    data.forEach((appointment) => {
      const appointmentDate = moment(
        appointment.date,
        'YYYY-MM-DD HH:mm:ss.SSSSSSS'
      );
      const appointmentMonth = appointmentDate.month();

      this.patientsMonthly[appointmentMonth]++;
    });
  }
  renderCharts(): void {
    if (typeof document !== 'undefined') {
      const ctx1 = (
        document.getElementById('appointmentChart') as HTMLCanvasElement
      ).getContext('2d');

      if (this.appointmentChart) this.appointmentChart.destroy();

      this.appointmentChart = new Chart(ctx1!, {
        type: 'line',
        data: {
          labels: moment.months(),
          datasets: [
            {
              label: 'عدد المرضى',
              data: this.patientsMonthly,
              fill: true,
              borderColor: 'rgba(75, 192, 192, 1)',
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
              tension: 0.4,
            },
          ],
        },
        options: {
          responsive: true,
          scales: {
            y: { beginAtZero: true },
            x: { type: 'category' },
          },
          plugins: { legend: { display: true, position: 'top' } },
        },
      });
    }
  }
}
