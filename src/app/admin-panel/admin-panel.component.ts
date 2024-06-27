import { Component, inject } from '@angular/core';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { RouterOutlet } from '@angular/router';
import { CountryComponent } from './Pricing/country/country.component';
import { InactivityService } from './inactive.service';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../environments/environment';
import { AuthService } from '../auth/auth.service';


@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [SidebarComponent,RouterOutlet,CountryComponent],
  templateUrl: './admin-panel.component.html',
  styleUrl: './admin-panel.component.css'
})
export class AdminPanelComponent {
  constructor(private inactivityService:InactivityService,private toastr:ToastrService , public authService:AuthService){}
  // static authService:AuthService = inject(AuthService);
  // static toastr:ToastrService = inject(ToastrService)

  public commonErrorHandler(err:any) {
    if (!err.error.status) {
      this.toastr.error(
        `Error while sending request to server`,
        'Error',
        environment.TROASTR_STYLE
      );
    } else if (err.error.status == 'Failure') {
      if (err.status == 401) {
        this.authService.userLogOut();
      } else {
        this.toastr.error(
          `${err.error.message}`,
          'Error',
          environment.TROASTR_STYLE
        );
      }
    } else {
      this.toastr.error(
        `Unknown Error`,
        'Error',
        environment.TROASTR_STYLE
      );
    }
  }


  // static authService: any;
  // static toastr: any;
  // constructor(public authService:AuthService,public toastr:ToastrService){
  //   this.authService = authService;
  //   this.toastr = toastr;
  // }
    // static authService:AuthService = inject(AuthService);

    // static toastr:ToastrService = inject(ToastrService);

  //   static commonErrorHandler(err:any) {
  //   if (!err.error.status) {
  //     this.toastr.error(
  //       `Error while sending request to server`,
  //       'Error',
  //       environment.TROASTR_STYLE
  //     );
  //   } else if (err.error.status == 'Failure') {
  //     if (err.status == 401) {
  //       this.authService.userLogOut();
  //     } else {
  //       this.toastr.error(
  //         `${err.error.message}`,
  //         'Error',
  //         environment.TROASTR_STYLE
  //       );
  //     }
  //   } else {
  //     this.toastr.error(
  //       `Unknown Error`,
  //       'Error',
  //       environment.TROASTR_STYLE
  //     );
  //   }
  // }
}
