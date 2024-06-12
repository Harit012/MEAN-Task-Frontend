import { Component, OnInit, inject } from '@angular/core';
import { SettingsService } from './settings.service';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../auth/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css',
})
export class SettingsComponent implements OnInit {
  formdata: FormData = new FormData();
  timeOutOptions: number[] = [10, 20, 30, 45, 60, 90];
  stopOptions: number[] = [1, 2, 3, 4, 5];
  selectedTimeOut!: number;
  selectedStops!: number;
  toastr= inject(ToastrService)
  constructor(private settingsService: SettingsService,private authService: AuthService) {}

  ngOnInit(): void {
    this.settingsService.getSettings().subscribe({
      next:(data) => {
        if (data.settings) {
          var timeOut = document.getElementById('timeOut') as HTMLSelectElement;
          var stops = document.getElementById('stops') as HTMLSelectElement;
          timeOut.selectedIndex = this.timeOutOptions.indexOf(
            data.settings.timeOut
          );
          stops.selectedIndex = this.stopOptions.indexOf(data.settings.stops);
          this.selectedTimeOut = data.settings.timeOut;
          this.selectedStops = data.settings.stops;
        }else if (data.varified == false) {
          this.authService.userLogOut();
        } else if (data.error) {
          this.toastr.error(`Error From Backend:- ${data.error}`, 'Error');
        }
      },
      error: (err)=>{
        this.toastr.error(`unable to Fetch data :- ${err.message}`)
      }
    });
  }

  onTimeOutChange(event: any) {
    this.selectedTimeOut = Number(event.target.value);
  }
  onStopsChange(event: any) {
    this.selectedStops = Number(event.target.value);
  }
  onSaveChanges() {
    this.settingsService
      .putSettings(this.selectedTimeOut, this.selectedStops)
      .subscribe({
        next:(data) => {
          if (data.message) {
            var timeOut = document.getElementById('timeOut') as HTMLSelectElement;
            var stops = document.getElementById('stops') as HTMLSelectElement;
            timeOut.selectedIndex = this.timeOutOptions.indexOf(
              this.selectedTimeOut
            );
            stops.selectedIndex = this.stopOptions.indexOf(this.selectedStops);
            this.toastr.success(`${data.message}`, 'Success');
          }else if (data.varified == false) {
            this.authService.userLogOut();
          } else if (data.error) {
            this.toastr.error(`Error From Backend:- ${data.error}`, 'Error');
          }
        },
        error:(err)=>{
          this.toastr.error(`unable to Fetch data :- ${err.message}`)
        }
      });
  }
}
