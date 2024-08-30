import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RideSocketService } from '../../Rides/services/ride-socket.service';
import {
  ConfirmedRide,
} from '../../Rides/confirmed-rides/confirmed-ride.interface';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { RunningRequestService } from './running-request.service';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../../../environments/environment';
import * as bootstrap from 'bootstrap';

@Component({
  selector: 'app-running-request',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './running-request.component.html',
  styleUrl: './running-request.component.css',
})
export class RunningRequestComponent implements OnInit {
  newRides: ConfirmedRide[] = [];
  acceptedRides: ConfirmedRide[] = [];
  confirmedRideForm: FormGroup;
  selectedRide: ConfirmedRide = {
    _id: '--',
    destination: '--',
    source: '--',
    time: '--',
    distance: 0,
    serviceType: '--',
    paymentMethod: '--',
    rideTime: '--',
    price: '--',
    driverProfit: '--',
    stops: [],
    stopPoints: [],
    endPoints: [],
    userName: '--',
    userPhone: '--',
    rideId: '--',
    rideType: '--',
    userProfile: '--',
    status: '--',
    driverId: '--',
    driverName: '--',
    sourceCity: '--',
  };
  userProfile: string = '--';
  invoiceObj: any = {};
  rating = 0; 
  stars = [1, 2, 3, 4, 5]; 

  map!: google.maps.Map;
  endPoints: google.maps.LatLngLiteral[] = [];
  stopPoints: google.maps.LatLngLiteral[] = [];
  directionsRenderer!: google.maps.DirectionsRenderer;
  data: any;

  constructor(
    private rideSocketService: RideSocketService,
    private runningRequestService: RunningRequestService,
    private toastr: ToastrService,
  ) {
    this.confirmedRideForm = new FormGroup({
      source: new FormControl(null),
      destination: new FormControl(null),
      price: new FormControl(null),
      distance: new FormControl(null),
      time: new FormControl(null),
      username: new FormControl(null),
      userphone: new FormControl(null),
      servicetype: new FormControl(null),
      paymentmethod: new FormControl(null),
      ridetime: new FormControl(null),
      rideid: new FormControl(null),
    });
  }

  ngOnInit(): void {
    this.runningRequestService.getRidesForRunningRequest().subscribe({
      next: (data) => {
        this.acceptedRides = data.acceptedRides;
        this.newRides = data.newRides;
      },
    });
    // socket events

    // when new ride is assigned
    this.rideSocketService.getAssignedRide().subscribe((data: any) => {
      this.newRides = this.newRides.filter((ride) => {
        return ride._id != data._id;
      });
      this.newRides.push(data);
    });
    // When ride is accepted
    this.rideSocketService.getAcceptedRide().subscribe((data: any) => {
      this.acceptedRides.push(data);
      this.newRides = this.newRides.filter((ride) => ride._id != data._id);
      let timer = document.getElementById(
        'remainingTime'
      ) as HTMLParagraphElement;
      timer.textContent = '';
    });
    // When Status Change
    this.rideSocketService.getStatusChange().subscribe((data: any) => {
      if(data.status != 'completed'){
        this.acceptedRides = this.acceptedRides.filter(
          (ride) => ride._id != data._id
        );
        this.acceptedRides.push(data);
      }
      else{
        this.acceptedRides = this.acceptedRides.filter(
          (ride) => ride._id != data._id
        );
      }
    });
    // When Ride is Canceled
    this.rideSocketService.cancleRide().subscribe((data: any) => {
      this.newRides = this.newRides.filter((ride) => ride._id != data._id);
    })

    // shows remaining time for driver 
    this.rideSocketService.getRemainingTime().subscribe((data: any)=>{
      let seconds = data.seconds;
      let id = data.rideId;
      let displaySeconds = document.getElementById(`${id}`) as HTMLParagraphElement ;
      if(seconds>0){
        displaySeconds.textContent = seconds;
      }else{
        displaySeconds.textContent = "0";
        
      }

    });
    // when ride is rejected
    this.rideSocketService.rejectRide().subscribe((data: any)=>{
      this.newRides = this.newRides.filter((ride)=>{return ride._id != data.rideId})
    })
    // when ride Completes
    this.rideSocketService.onCompeteRide().subscribe((data: any)=>{
      console.log(data)
      this.acceptedRides = this.acceptedRides.filter((ride)=>{return ride._id != data._id})
    })
  }

  // when driver rejects ride
  onRejectRequest(i: number) {
    this.runningRequestService.patchDriverResponse(this.newRides[i]._id,0).subscribe({
      next: (data) => {
        this.toastr.success(`Ride rejected `, '', environment.TROASTR_STYLE);
      },
    });
  }
  // when driver accept ride
  onAcceptRequest(i: number) {
    this.runningRequestService.patchDriverResponse(this.newRides[i]._id,1).subscribe({
      next: (data) => {
        this.toastr.success(`Ride Accepted `, '', environment.TROASTR_STYLE);
      },
    });
  }
  // when driver change ride status
  onStatusChange(i: number) {
    let selectInput = document.getElementById(`${i}`) as HTMLSelectElement;
    let updatedStatus = selectInput.value;
    if (updatedStatus != this.acceptedRides[i].status) {
      if(updatedStatus == 'completed'){
        this.runningRequestService.patchCompleteRide(this.acceptedRides[i]._id).subscribe({
          next: (data) => {
            if(data.ride){
              this.showInvoice(data.ride);
              this.toastr.success(
                `Ride Completed `,
                '',
                environment.TROASTR_STYLE
              );
            }else if(data.link){
              let a = document.createElement('a');
              a.href = data.link;
              a.click();
            }
          }
        })
      }
      else{
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
      }
    } else {
      this.toastr.info(`no changes Made `, '', environment.TROASTR_STYLE);
    }
  }
  // onClickShowDetails
  onClickShowDetails(i: number) {
    this.confirmedRideForm.disable();

    this.selectedRide = this.newRides[i];
    this.endPoints = this.newRides[i].endPoints;
    this.stopPoints = this.newRides[i].stopPoints;
    this.initMap();
    this.confirmedRideForm.patchValue({
      source: this.newRides[i].source,
      destination: this.newRides[i].destination,
      price: this.newRides[i].price,
      distance: this.newRides[i].distance,
      time: this.newRides[i].time,
      username: this.newRides[i].userName,
      userphone: this.newRides[i].userPhone,
      ridetime: this.newRides[i].rideTime,
      rideid: this.newRides[i].rideId,
      paymentmethod: this.newRides[i].paymentMethod,
      servicetype: this.newRides[i].serviceType,
      userProfile: this.newRides[i].userProfile,
    });
    this.userProfile = `${environment.BASE_URL}${this.newRides[i].userProfile}`;
    const modal = bootstrap.Modal.getOrCreateInstance(
      document.getElementById('confirmedRideModal') as HTMLElement
    );
    modal.show();
  }
  initMap() {
    let bounds = new google.maps.LatLngBounds();
    this.map = new google.maps.Map(
      document.getElementById('map') as HTMLElement,
      {
        center: { lat: 52.7572, lng: 12.8022 },
        zoom: 10,
        mapId: '8f2d9c7f9f9f8a9f',
      }
    );
    this.directionsRenderer = new google.maps.DirectionsRenderer({
      hideRouteList: true,
      polylineOptions: {
        strokeColor: 'green',
        strokeOpacity: 1,
        strokeWeight: 3,
      },
    });
    const directionServices = new google.maps.DirectionsService();
    const request = {
      origin: this.endPoints[0],
      destination: this.endPoints[1],
      travelMode: google.maps.TravelMode.DRIVING,
      waypoints: this.stopPoints.map((stop) => ({
        location: stop,
        stopover: true,
      })),
      optimizeWaypoints: true,
    };
    directionServices.route(request, (result: any, status) => {
      this.directionsRenderer.setMap(this.map);
      this.directionsRenderer.setDirections(result);
      this.endPoints.forEach((point) => {
        bounds.extend(point);
      });
      this.stopPoints.forEach((point) => {
        bounds.extend(point);
      });
      this.map.fitBounds(bounds);
    });
  }
  //
  showInvoice(ride:ConfirmedRide) {
    this.invoiceObj = {
      id:ride._id,
      driver_stripe_id:ride.driver_stripe_id,
      customerId:ride.customerId,
      destination: ride.destination,
      source: ride.source,
      rideTime: ride.rideTime,
      userName: ride.userName,
      time: ride.time,
      paymentMethod: ride.paymentMethod,
      serviceType: ride.serviceType,
      price: ride.price,
      driverName: ride.driverName,
      driverProfit: ride.driverProfit,
      csn:ride.csn,
      distance:ride.distance,
    }
    const modal = bootstrap.Modal.getOrCreateInstance(
      document.getElementById('invoiceModal') as HTMLElement
    );
    modal.show();
  }

  
  onProceedToPayment(){
    this.invoiceObj.rating = this.rating;
    this.runningRequestService.postPaymentProcess(this.invoiceObj).subscribe({
      next:(data)=>{
        if(data.link){
          let a = document.createElement('a');
          a.href = data.link;
          a.click();
        }
        else if(data.message){
          this.toastr.success(data.message,'',environment.TROASTR_STYLE);
        } 
        this.rating = 0;       
      }
    })
  }

  

  rate(rating: number) {
    this.rating = rating;
  }
}
