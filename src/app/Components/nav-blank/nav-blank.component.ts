import { Router, RouterModule } from '@angular/router';
import { AuthService } from './../../shared/services/auth.service';
import { Component, OnInit, ViewChild, TemplateRef, HostListener } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common'; 
import { NotificationService } from '../../shared/services/notification.service';
import { catchError, interval, Subscription, switchMap } from 'rxjs';
import { PatientService } from '../../shared/services/patient.service';

@Component({
  selector: 'app-nav-blank',
  standalone: true,
  imports: [RouterModule,CommonModule],
  templateUrl: './nav-blank.component.html',
  styleUrls: ['./nav-blank.component.css']
})
export class NavBlankComponent implements OnInit {

  @ViewChild('logoutModal') logoutModal!: TemplateRef<any>;
  private modalRef: any; 
  unreadCount: number = 0;
  pollingSubscription: Subscription | undefined;
  islogin: boolean = false;
  notifications: any[] = [];
  dropdownOpen: boolean = false;
  userData:any;
  patientId:number=0;
  constructor(
    private _AuthService: AuthService,
    private modalService: NgbModal,
    private router: Router,
    private notificationService: NotificationService,
    private _patient:PatientService
  ) {}

  ngOnInit(): void {
    if (typeof window !== 'undefined' && localStorage.getItem('eToken')) {
      this.islogin = true;
      this.userData=this._AuthService.getUserData();         
      this.loadNotifications();
      this.startPolling(); 
    }
  }

  ngOnDestroy() {
    this.stopPolling(); // Stop polling when the component is destroyed
  }

  loadNotifications(): void {
    this._patient.getPatientData().subscribe(
      {
        next:(data)=>{
          this.patientId = data.find((p: { userId: any }) => p.userId === this.userData.nameidentifier)?.patientId || null;            
        },
        error:(response)=>{
            console.log(response);
        }

      }
    )
    this.notificationService.getNotifications().pipe(
      catchError((error) => {
        console.error('Error fetching notifications', error);
        return []; // Return an empty array in case of an error
      })
    ).subscribe((data) => {
      this.notifications = data.filter((notification: { patientId: number }) => notification.patientId === this.patientId);
      this.updateUnreadCount();
    });
  }

  markAsRead(notification: any): void {
    if (!notification.isRead) {
      this.notificationService.markNotificationAsRead(notification.notificationId).subscribe(
        () => {
          notification.isRead = true;
          this.updateUnreadCount();
          console.log('Notification marked as read on the server');
        },
        (error) => {
          console.error('Error marking notification as read', error);
        }
      );
    }
  }

  get sortedNotifications() {
    return this.notifications.sort((a, b) => Number(a.isRead) - Number(b.isRead));
  }

  updateUnreadCount(): void {
    this.unreadCount = this.notifications.filter(notification => !notification.isRead).length;
  }

  startPolling() {
    this.pollingSubscription = interval(2000) // Poll every 10 seconds
      .pipe(
        switchMap(() => this.notificationService.getNotifications()), // Fetch notifications
        catchError((error) => {
          console.error('Error fetching notifications during polling', error);
          return []; // Return an empty array if an error occurs
        })
      )
      .subscribe((data) => {
        this.notifications = data.filter((notification: { patientId: number }) => notification.patientId === this.patientId);
        this.updateUnreadCount();
      });
  }

  stopPolling() {
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe(); // Unsubscribe to stop polling
    }
  }

  @HostListener('document:click', ['$event'])
  closeDropdown(event: Event): void {
    const targetElement = event.target as HTMLElement;
    if (!targetElement.closest('.nav-item')) {
      this.dropdownOpen = false;
    }
  }



  
  toggleDropdown(): void {
    this.dropdownOpen = !this.dropdownOpen;
  }


  confirmLogout(): void {
    this.modalRef = this.modalService.open(this.logoutModal); 
  }

  
  logOutUser(): void {
    if (this.modalRef) {
      this.modalRef.dismiss(); 
    }
    this._AuthService.logOut();
    this.router.navigate(['/login']);
}
}