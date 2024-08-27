import { Component, OnInit } from '@angular/core';
import { ConfirmedRidesService } from './confirmed-rides.service';
import { ConfirmedRide } from './confirmed-ride.interface';
import { CommonModule } from '@angular/common';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import * as bootstrap from 'bootstrap';
import { RideSocketService } from '../services/ride-socket.service';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../../../environments/environment';
import { VehicleTypeService } from '../../Pricing/vehicle-type/vehicle-type.service';
import { Subscription } from 'rxjs';
import { RideDriver } from './RideDriver.interface';
import { CommonStatic } from '../../../shared/CommonStatic'

@Component({
  selector: 'app-confirmed-rides',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './confirmed-rides.component.html',
  styleUrl: './confirmed-rides.component.css',
})
export class ConfirmedRidesComponent implements OnInit {
  availableRides: ConfirmedRide[] = [];
  // filterForm: FormGroup;
  totalRides: ConfirmedRide[] = [];
  confirmedRideForm: FormGroup;
  driversList: RideDriver[] = [];
  userProfile!: string;
  serviceTypes: string[] = [];
  timeOut: number = 10;
  selectedRideForAssign: ConfirmedRide = {
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
  subscriptions: Subscription[] = [];
  selectedServiceType: string = 'all';
  selectedstatus: string = 'all';

  map!: google.maps.Map;
  endPoints: google.maps.LatLngLiteral[] = [];
  stopPoints: google.maps.LatLngLiteral[] = [];
  directionsRenderer!: google.maps.DirectionsRenderer;

  constructor(
    private confirmedRideService: ConfirmedRidesService,
    private rideSocketService: RideSocketService,
    private toastr: ToastrService,
    private vehicleTypeService: VehicleTypeService
  ) {
    // map api 
    CommonStatic.addGoogleApi();
    
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
      sourceCity: new FormControl(null),
    });
  }

  ngOnInit() {    
    // to get rides from server
    this.confirmedRideService.getRides().subscribe({
      next: (data) => {
        this.totalRides = data.rides;
        this.availableRides = data.rides;
      },
    });
    // to get service types from server
    this.vehicleTypeService.getAllVehicleTypes().subscribe({
      next: (data) => {
        this.serviceTypes = data.allVehicleTypes;
      },
    });
    // socket events

    // when new ride is created
    this.rideSocketService.getNewRide().subscribe((ride: any) => {
      this.totalRides.unshift(ride);
      this.onFilterRides();
    });
    // when admin cancels ride
    this.rideSocketService.cancleRide().subscribe((cancelRide: any) => {
      let modal = bootstrap.Modal.getOrCreateInstance(
        document.getElementById('AssignModal') as HTMLElement
      );
      this.totalRides = this.totalRides.filter((ride) => {
        return cancelRide._id != ride._id;
      });
      modal.hide();
      this.onFilterRides();
    });
    // When driver is assigned to ride
    this.rideSocketService.getAssignedRide().subscribe((data: any) => {
      let modal = bootstrap.Modal.getOrCreateInstance(
        document.getElementById('AssignModal') as HTMLElement
      );
      modal.hide();
      let assignButton = document.getElementById(
        `rideButton${data._id}`
      ) as HTMLButtonElement;
      assignButton.classList.add('btn-warning');
      assignButton.disabled = true;
      assignButton.textContent = `Assignig to ${data.driverName}`;
    });

    // when driver Accepts ride
    this.rideSocketService.getAcceptedRide().subscribe((data: any) => {
      this.totalRides = this.totalRides.filter((ride) => {
        return ride._id != data._id;
      });
      this.totalRides.push(data);
      this.onFilterRides();
    });
    // Cron End
    this.rideSocketService.onCronStop().subscribe((data: any) => {
      if (data.message == 'All Drivers are Busy') {
        let assignButton = document.getElementById(
          `rideButton${data.rideId}`
        ) as HTMLButtonElement;
        assignButton.classList.remove('btn-warning');
        assignButton.disabled = false;
        assignButton.textContent = `Re Assign`;
      } else {
      }
    });
    // When a ride is Completed
    this.rideSocketService.onCompeteRide().subscribe((data: any) => {
      this.totalRides = this.totalRides.filter((ride) => {
        return ride._id != data._id;
      });
      this.onFilterRides();
    });
    // When ride status change
    this.rideSocketService.getStatusChange().subscribe((data: any) => {
      this.totalRides = this.totalRides.filter((ride) => {
        return ride._id != data._id;
      });
      this.totalRides.push(data);
      this.onFilterRides();
    });
    // when ride is on hold
    this.rideSocketService.onHoldRide().subscribe((data: any) => {
      let modal = bootstrap.Modal.getOrCreateInstance(
        document.getElementById('AssignModal') as HTMLElement
      );
      modal.hide();
      let assignButton = document.getElementById(
        `rideButton${data}`
      ) as HTMLButtonElement;
      assignButton.classList.add('btn-warning');
      assignButton.disabled = true;
      assignButton.textContent = `on Hold`;
    });
  }
  // get detiled information about ride
  onClickRide(index: number) {
    this.confirmedRideForm.disable();
    this.selectedRideForAssign = this.availableRides[index];
    this.endPoints = this.availableRides[index].endPoints;
    this.stopPoints = this.availableRides[index].stopPoints;
    this.initMap();
    this.confirmedRideForm.patchValue({
      source: this.availableRides[index].source,
      destination: this.availableRides[index].destination,
      price: this.availableRides[index].price,
      distance: this.availableRides[index].distance,
      time: this.availableRides[index].time,
      username: this.availableRides[index].userName,
      userphone: this.availableRides[index].userPhone,
      ridetime: this.availableRides[index].rideTime,
      rideid: this.availableRides[index].rideId,
      paymentmethod: this.availableRides[index].paymentMethod,
      servicetype: this.availableRides[index].serviceType,
      userProfile: this.availableRides[index].userProfile,
      sourceCity: this.availableRides[index].sourceCity,
    });
    this.userProfile = `${environment.BASE_URL}${this.availableRides[index].userProfile}`;
    const modal = bootstrap.Modal.getOrCreateInstance(
      document.getElementById('confirmedRideModal') as HTMLElement
    );
    modal.show();
  }
  // When admin rejects the ride
  onRejectRide(id: string) {
    this.confirmedRideService.cancleRide(id).subscribe({
      next: (data) => {
        this.toastr.success(
          'Ride Canceled',
          'Success',
          environment.TROASTR_STYLE
        );
      },
    });
  }
  // on click of assign ride
  onAssignRide(id: string) {
    // this.selectedRideForAssign = this.availableRides[index];
    let rideSet = this.availableRides.filter((ride) => {
      return ride._id == id;
    });
    this.selectedRideForAssign = rideSet[0];
    // to get drivers from server
    this.confirmedRideService
      .getAllDrivers(
        this.selectedRideForAssign.sourceCity,
        this.selectedRideForAssign.serviceType,
        this.selectedRideForAssign._id
      )
      .subscribe({
        next: (data) => {
          this.driversList = data.driversList;
        },
      });
    let modal = bootstrap.Modal.getOrCreateInstance(
      document.getElementById('AssignModal') as HTMLElement
    );
    modal.show();
    // get timeOut
    this.confirmedRideService.getTimeOut().subscribe({
      next: (data) => {
        this.timeOut = data.timeOut;
      },
    });
  }
  // on search Input value change
  onSearchInputChange(event: any) {
    let input = event.target.value;
    this.availableRides = this.totalRides.filter((ride) => {
      return (
        RegExp(input).exec(ride.userName) ||
        RegExp(input).exec(ride.userPhone) ||
        RegExp(input).exec(ride.rideId) ||
        RegExp(input).exec(ride.rideTime)
      );
    });
  }

  onServiceTypeChange(event: any) {
    this.selectedServiceType = event.target.value;
    console.log(this.selectedServiceType);
  }
  onStatusChange(event: any) {
    this.selectedstatus = event.target.value;
    console.log(this.selectedstatus);
  }
  //  on filter
  onFilterRides() {
    this.availableRides = this.totalRides.filter((ride) => {
      let bool1 = false;
      let bool2 = false;
      if (this.selectedServiceType != 'all') {
        bool1 = ride.serviceType == this.selectedServiceType;
      } else {
        bool1 = true;
      }
      if (this.selectedstatus != 'all') {
        bool2 = ride.status == this.selectedstatus;
      } else {
        bool2 = true;
      }
      return bool1 && bool2;
    });
  }
  // to show map of ride
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
    this.directionsRenderer = new google.maps.DirectionsRenderer({
      hideRouteList: true,
      polylineOptions: {
        strokeColor: 'green',
        strokeOpacity: 1,
        strokeWeight: 3,
      },
    });
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
  // whenn driver is assigned manually
  onAssignDriverManually(index: number) {
    this.confirmedRideService
      .assignDriver(this.selectedRideForAssign._id, this.driversList[index]._id)
      .subscribe();
  }

  onAssignDriverAuto() {
    this.confirmedRideService
      .assignAnyDriver(this.selectedRideForAssign._id)
      .subscribe({
        next: (data) => {},
      });
  }
}
