import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'app-nav-dashboard',
  standalone: true,
  imports: [CommonModule,RouterModule],
  templateUrl: './nav-dashboard.component.html',
  styleUrl: './nav-dashboard.component.css'
})
export class NavDashboardComponent {
  constructor(private _AuthService:AuthService) {}

logOutUser():void{  
this._AuthService.logOut();
}

}
