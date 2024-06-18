import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule,RouterLink],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  isRidesDropdownOpen: boolean = false;
  isDriverDropdownOpen: boolean = false;
  isPricingDropdownOpen: boolean = false;

  constructor(private authservice: AuthService){}
  toggleDropdown(dropdownName: string) {
    if (dropdownName === 'rides') {
      this.isRidesDropdownOpen = !this.isRidesDropdownOpen;
    } else if (dropdownName === 'driver') {
      this.isDriverDropdownOpen = !this.isDriverDropdownOpen;
    } else if (dropdownName === 'pricing') {
      this.isPricingDropdownOpen = !this.isPricingDropdownOpen;
    }
  }

  onClickLogOut(){
    this.authservice.logOutManually();
  }
}
