import { Component } from '@angular/core';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { RouterOutlet } from '@angular/router';
import { CountryComponent } from './Pricing/country/country.component';
import { InactivityService } from './inactive.service';

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [SidebarComponent,RouterOutlet,CountryComponent],
  templateUrl: './admin-panel.component.html',
  styleUrl: './admin-panel.component.css'
})
export class AdminPanelComponent {

  constructor(private inactivityService:InactivityService){}
}
