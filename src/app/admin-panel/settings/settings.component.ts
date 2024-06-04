import { Component, OnInit } from '@angular/core';
import { SettingsService } from './settings.service';
import { CommonModule } from '@angular/common';
import { Settings } from './settings.interface';

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
  constructor(private settingsService: SettingsService) {}

  ngOnInit(): void {
    this.settingsService.getSettings().subscribe((data) => {
      if (data.settings) {
        var timeOut = document.getElementById('timeOut') as HTMLSelectElement;
        var stops = document.getElementById('stops') as HTMLSelectElement;
        timeOut.selectedIndex = this.timeOutOptions.indexOf(
          data.settings.timeOut
        );
        stops.selectedIndex = this.stopOptions.indexOf(data.settings.stops);
        this.selectedTimeOut = data.settings.timeOut;
        this.selectedStops = data.settings.stops;
      } else {
        alert(data.error);
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
      .subscribe((data) => {
        if (data.message) {
          var timeOut = document.getElementById('timeOut') as HTMLSelectElement;
          var stops = document.getElementById('stops') as HTMLSelectElement;
          timeOut.selectedIndex = this.timeOutOptions.indexOf(
            this.selectedTimeOut
          );
          stops.selectedIndex = this.stopOptions.indexOf(this.selectedStops);
        } else {
          alert('settings are not updated\n' + data.error);
        }
      });
  }
}
