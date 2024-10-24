import { forgetGuard } from './shared/guard/forget.guard';
import { Routes } from '@angular/router';
import { LoginComponent } from './Components/login/login.component';
import { RegisterComponent } from './Components/register/register.component';
import { ResetCodeComponent } from './Components/reset-code/reset-code.component';
import { ErrorComponent } from './Components/error/error.component';
import { HomeComponent } from './Components/home/home.component';
import { BlankLayoutComponent } from './Components/blank-layout/blank-layout.component';
import { AuthLayoutComponent } from './Components/auth-layout/auth-layout.component';
import { ServicesComponent } from './Components/services/services.component';
import { AboutComponent } from './Components/aboutus/aboutus.component';
import { ContactusComponent } from './Components/contactus/contactus.component';
import { BookComponent } from './Components/book/book.component';
import { ForgotPasswordComponent } from './Components/forget-password/forgot-password.component';
import { DashboardLayoutComponent } from './Components/dashboard-layout/dashboard-layout.component';
import { HomeDashboardComponent } from './Components/home-dashboard/home-dashboard.component';
import { AppoinmentDashboardComponent } from './Components/appoinment-dashboard/appoinment-dashboard.component';
import { PatientDashboardComponent } from './Components/patient-dashboard/patient-dashboard.component';
import { LoginDashboardComponent } from './Components/login-dashboard/login-dashboard.component';
import { ProfileComponent } from './Components/profile/profile.component';
import { ChangePasswordComponent } from './Components/change-password/change-password.component';
import { BookDashboardComponent } from './Components/book-dashboard/book-dashboard.component';
import { UpdateBranchPasswordDashboardComponent } from './Components/update-branch-password-dashboard/update-branch-password-dashboard.component';
import { AuthDashboardComponent } from './Components/auth-dashboard/auth-dashboard.component';
import { ProfitDashboardComponent } from './Components/profit-dashboard/profit-dashboard.component';
import { bookGuard } from './shared/guard/book.guard';
import { dashboardGuard } from './shared/guard/dashboard.guard';
import { PatientChatComponent } from './Components/patient-chat/patient-chat.component';
import { DoctorChatComponent } from './Components/doctor-chat/doctor-chat.component';
import { ChangeTimeDashboardComponent } from './Components/ChangeTime-Dashboard/change-time-dashboard/change-time-dashboard.component';
import { ChatbotComponent } from './Components/chatbot/chatbot.component';
import { UpdateBranchGuard } from './shared/guard/update-branch.guard';


export const routes: Routes = [
  {
    path: '',
    component: AuthLayoutComponent,
    children: [
      { path: '', component: LoginComponent, title: 'login' },
      { path: 'login', component: LoginComponent, title: 'login' },
      { path: 'register', component: RegisterComponent, title: 'Register' },
      { path: 'forgotPassword', component: ForgotPasswordComponent, title: 'Forgot password' },
      { path: 'ResetCode', component: ResetCodeComponent, title: 'Reset Code', canActivate: [forgetGuard] },
    ],
  },
  {
    path: '',
    component: BlankLayoutComponent,
    children: [
      { path: 'home', component: HomeComponent, title: 'Home' },
      { path: 'chat', component: ChatbotComponent, title: 'Chatbot' },
      { path: 'service', component: ServicesComponent, title: 'services' },
      { path: 'about', component: AboutComponent, title: 'About us' },
      { path: 'profile', component: ProfileComponent, title: 'Profile' },
      { path: 'contact', component: ContactusComponent, title: 'contact us' },
      { path: 'book', component: BookComponent, title: 'Book', canActivate: [bookGuard] },
      { path: 'ChangePassword', component: ChangePasswordComponent, title: 'Change Password' },
      { path: 'PatientChat', component: PatientChatComponent, title: 'Patient Chat' },
    ],
  },
  {
    path: '',
    component: AuthDashboardComponent,
    children: [
      { path: 'DashboardGloosy', component: LoginDashboardComponent, title: 'login Admin' },
      { path: 'DashboardGloosy/login', component: LoginDashboardComponent, title: 'login Admin' },
    ],
  },
  {
    path: '',
    component: DashboardLayoutComponent,
    canActivate: [dashboardGuard],  // Applying AuthGuard to all dashboard routes
    children: [
      { path: 'DashboardGloosy/home', component: HomeDashboardComponent, title: 'dashboard' },
      { path: 'DashboardGloosy/profit-dashboard', component: ProfitDashboardComponent, title: 'profit-dashboard' },
      { path: 'DashboardGloosy/appoinment', component: AppoinmentDashboardComponent, title: 'appoinment' },
      { path: 'DashboardGloosy/patient', component: PatientDashboardComponent, title: 'patient' },
      { path: 'DashboardGloosy/book', component: BookDashboardComponent, title: 'Book' },
      { path: 'DashboardGloosy/update', component: UpdateBranchPasswordDashboardComponent, title: 'update',canActivate: [UpdateBranchGuard] },
      { path: 'DashboardGloosy/update', component: UpdateBranchPasswordDashboardComponent, title: 'update' ,canActivate: [UpdateBranchGuard]},
      { path: 'DashboardGloosy/DoctorChat', component: DoctorChatComponent, title: 'Doctor Chat' },
      { path: 'DashboardGloosy/changetime', component: ChangeTimeDashboardComponent, title: 'update' },
    ],
  },
  { path: '**', component: ErrorComponent, title: '404 Not Found' },
];
