import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavDashboardComponent } from "../nav-dashboard/nav-dashboard.component";

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [RouterOutlet, NavDashboardComponent],
  templateUrl: './dashboard-layout.component.html',
  styleUrl: './dashboard-layout.component.css'
})
export class DashboardLayoutComponent {

}
