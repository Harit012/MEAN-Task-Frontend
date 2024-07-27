import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { RouterLink } from '@angular/router';
import { LoaderComponent } from '../loader/loader.component';
import { LoaderService } from '../admin-panel/loader.service';
import { RideSocketService } from '../admin-panel/Rides/services/ride-socket.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, LoaderComponent],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent implements OnInit {
  isRidesDropdownOpen: boolean = false;
  isDriverDropdownOpen: boolean = false;
  isPricingDropdownOpen: boolean = false;
  isLoader: boolean = false;

  constructor(
    private authservice: AuthService,
    private loaderService: LoaderService,
    private rideSocketService : RideSocketService

  ) {}

  ngOnInit(): void {
    let count = 0;
    this.rideSocketService.onCronStop().subscribe((data: any ) => {
      if(data.status == "accepted"){
        if(count > 0 ){
          count--
        }
      }
      else{
        count++;
      }
      let notification = document.getElementById('notification-handler') as HTMLAnchorElement;
      notification.innerHTML = `<i class="fa fa-bell" aria-hidden="true"></i>Notifications (${count})`
    })

    this.loaderService.subject.subscribe((data: boolean) => {
      this.isLoader = data;
      console.log(this.isLoader);
    });
  }
  toggleDropdown(dropdownName: string) {
    if (dropdownName === 'rides') {
      this.isRidesDropdownOpen = !this.isRidesDropdownOpen;
    } else if (dropdownName === 'driver') {
      this.isDriverDropdownOpen = !this.isDriverDropdownOpen;
    } else if (dropdownName === 'pricing') {
      this.isPricingDropdownOpen = !this.isPricingDropdownOpen;
    }
  }

  onClickLogOut() {
    this.authservice.logOutManually();
  }
}
