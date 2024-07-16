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
import { DriverService } from '../../Drivers/list/driver.service';
import { Driver } from '../../Drivers/list/driver.interface';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../../../environments/environment';
import { VehicleTypeService } from '../../Pricing/vehicle-type/vehicle-type.service';

@Component({
  selector: 'app-confirmed-rides',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './confirmed-rides.component.html',
  styleUrl: './confirmed-rides.component.css',
})
export class ConfirmedRidesComponent implements OnInit {
  availableRides: ConfirmedRide[] = [];
  filterForm: FormGroup;
  totalRides: ConfirmedRide[] = [];
  confirmedRideForm: FormGroup;
  driversList: Driver[] = [];
  userProfile!: string;
  serviceTypes: string[] = [];
  selectedRideForAssign!: ConfirmedRide;

  map!: google.maps.Map;
  endPoints: google.maps.LatLngLiteral[] = [];
  stopPoints: google.maps.LatLngLiteral[] = [];
  directionsRenderer = new google.maps.DirectionsRenderer({
    hideRouteList: true,
    polylineOptions: {
      strokeColor: 'blue',
      strokeOpacity: 1,
      strokeWeight: 3,
    },
  });

  constructor(
    private confirmedRideService: ConfirmedRidesService,
    private rideSocketService: RideSocketService,
    private driverService: DriverService,
    private toastr: ToastrService,
    private vehicleTypeService: VehicleTypeService
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
    this.filterForm = new FormGroup({
      serviceType: new FormControl('all'),
      status: new FormControl('all'),
    });
  }

  ngOnInit() {
    // to get drivers from server
    this.driverService.getDrivers(0, 'none', '').subscribe({
      next: (data) => {
        this.driversList = data.drivers;
      },
    });
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
      this.totalRides = this.availableRides;
      // this.availableRides.unshift(ride);
    });
    // when admin cancels ride
    this.rideSocketService.cancleRide().subscribe((rideId: any) => {
      this.totalRides = this.totalRides.filter((ride) => {
        return rideId != ride._id;
      });
      this.availableRides = this.totalRides;
    });

    // when driver Accepts ride
    this.rideSocketService.getAcceptedRide().subscribe((data: any) => {
      console.log(data)
      this.totalRides = this.totalRides.filter((ride) => {
        return ride._id != data._id;
      })
      this.totalRides.push(data)
      this.availableRides = this.totalRides
    })

    // When ride status change
    this.rideSocketService.getStatusChange().subscribe((data: any) => {
      this.totalRides = this.totalRides.filter((ride) => {
        return ride._id != data._id;
      })
      this.totalRides.push(data)
      this.availableRides = this.totalRides
    })
  }
  // get detiled information about ride
  onClickRide(index: number) {
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
  onAssignRide(index: number) {
    let modal = bootstrap.Modal.getOrCreateInstance(
      document.getElementById('AssignModal') as HTMLElement
    );
    modal.show();
    this.selectedRideForAssign = this.availableRides[index];
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
  //  on filter
  onFilterRides() {
    let st = this.filterForm.value.serviceType;
    let s = this.filterForm.value.status;
    if (s == 'all' && st == 'all') {
      this.availableRides = this.totalRides;
    } else if (s != 'all' && st == 'all') {
      this.availableRides = this.totalRides.filter((ride) => {
        return ride.status == s;
      });
    } else if (s == 'all' && st != 'all') {
      this.availableRides = this.totalRides.filter((ride) => {
        return ride.serviceType == st;
      });
    } else {
      this.availableRides = this.totalRides.filter((ride) => {
        return ride.status == s && ride.serviceType == st;
      });
    }
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
  onAssignDriver(index: number) {
    this.confirmedRideService.assignDriver(this.selectedRideForAssign._id,this.driversList[index]._id!).subscribe({
      next: (data) => {
        this.selectedRideForAssign = data.ride;
        this.toastr.info(
          `Your ride is assigned to ${this.driversList[index].driverName}`,
          '',
          environment.TROASTR_STYLE
        );
      }
    })
  }
}
