import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RideSocketService } from '../../Rides/services/ride-socket.service';
import { ConfirmedRide } from '../../Rides/confirmed-rides/confirmed-ride.interface';
import { FormsModule } from '@angular/forms';
import { RunningRequestService } from './running-request.service';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-running-request',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './running-request.component.html',
  styleUrl: './running-request.component.css',
})
export class RunningRequestComponent implements OnInit {
  newRides: ConfirmedRide[] = [];
  acceptedRides: ConfirmedRide[] = [];
  temp: any = [];

  constructor(
    private rideSocketService: RideSocketService,
    private runningRequestService: RunningRequestService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.runningRequestService.getRidesForRunningRequest().subscribe({
      next: (data) => {
        this.acceptedRides = data.rides;
      },
    });
    // socket events
    // when new ride is assigned
    this.rideSocketService.getAssignedRide().subscribe((data: any) => {
      this.newRides.unshift(data);
      // this.temp =data
      
      console.log("andar aviyo",   this.temp);
      console.log(`===================================================================================`)
      console.log(data)
      console.log(`===================================================================================`)
      console.log(this.newRides)
    });
    // When ride is accepted
    this.rideSocketService.getAcceptedRide().subscribe((data: any) => {
      this.acceptedRides.push(data);
      this.newRides = this.newRides.filter((ride) => ride._id != data._id);
    });
    // When Status Change
    this.rideSocketService.getStatusChange().subscribe((data: any) => {
      this.acceptedRides = this.acceptedRides.filter(
        (ride) => ride._id != data._id
      )
      this.acceptedRides.push(data);
    })
  }

  onRejectRequest(i: number) {
    this.newRides.splice(i, 1);
  }

  onAcceptRequest(i: number) {
    this.runningRequestService.patchAcceptRide(this.newRides[i]._id).subscribe({
      next: (data) => {
        this.toastr.success(`Ride Accepted `, '', environment.TROASTR_STYLE);
      },
    });
  }

  onStatusChange(i: number) {
    let selectInput = document.getElementById(`${i}`) as HTMLSelectElement;
    let updatedStatus = selectInput.value;
    if (updatedStatus != this.acceptedRides[i].status) {
      this.runningRequestService
        .patchChangeStatus(this.acceptedRides[i]._id, updatedStatus)
        .subscribe({
          next: (data) => {
            this.toastr.success(
              `Status Updated `,
              '',
              environment.TROASTR_STYLE
            );
          },
        });
    } else {
      this.toastr.info(`no changes Made `, '', environment.TROASTR_STYLE);
    }
  }
}
