import { Component, OnInit } from '@angular/core';
import { RideSocketService } from '../services/ride-socket.service';
import { RideHistoryService } from './ride-history.service';
import { ConfirmedRide } from '../confirmed-rides/confirmed-ride.interface';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import * as bootstrap from 'bootstrap';
import { environment } from '../../../../environments/environment';
import { CsvExportService } from './csvExport.service';
import { VehicleTypeService } from '../../Pricing/vehicle-type/vehicle-type.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-ride-history',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './ride-history.component.html',
  styleUrl: './ride-history.component.css',
})
export class RideHistoryComponent implements OnInit {
  rideList: ConfirmedRide[] = [];
  mainRideList: ConfirmedRide[] = [];
  rideForm: FormGroup;
  userProfile: string = '';
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
  vehicleTypes: string[] = [];
  fromDate: Date | undefined;
  toDate: Date | undefined;
  selectedType: string = 'all';
  selectedStatus: string = 'all';

  // map element

  map!: google.maps.Map;
  endPoints: google.maps.LatLngLiteral[] = [];

  constructor(
    private rideSocketService: RideSocketService,
    private rideHistoryService: RideHistoryService,
    private csvExportService: CsvExportService,
    private vehicleTypeService: VehicleTypeService,
    private toasr: ToastrService
  ) {
    this.rideForm = new FormGroup({
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
      driverName: new FormControl(null),
    });
  }

  ngOnInit(): void {
    this.rideHistoryService.getAllRides().subscribe({
      next: (data) => {
        this.mainRideList = data.rides;
        this.rideList = data.rides;
      },
    });
// on cancel ride
    this.rideSocketService.cancleRide().subscribe((data: any) => {
      this.mainRideList.unshift(data);
      this.onClickFilter();
    });

    // onCompleteRide
    this.rideSocketService.onCompeteRide().subscribe((data: any) => {
      this.mainRideList.unshift(data);
      this.onClickFilter();
    })
    this.vehicleTypeService.getAllVehicleTypes().subscribe({
      next: (data) => {
        this.vehicleTypes = data.allVehicleTypes;
      },
    });
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
    let polyLine = new google.maps.Polyline({
      path: this.endPoints,
      geodesic: true,
      strokeColor: '#FF0000',
      strokeOpacity: 1.0,
      strokeWeight: 2,
    });
    polyLine.setMap(this.map);
    this.endPoints.forEach((point) => {
      bounds.extend(point);
    });
    this.map.fitBounds(bounds);
  }
  onClickRide(index: number) {
    this.rideForm.disable();
    this.selectedRide = this.rideList[index];
    this.endPoints = this.rideList[index].endPoints;
    this.initMap();
    this.rideForm.patchValue({
      source: this.rideList[index].source,
      destination: this.rideList[index].destination,
      price: this.rideList[index].price,
      distance: this.rideList[index].distance,
      time: this.rideList[index].time,
      username: this.rideList[index].userName,
      userphone: this.rideList[index].userPhone,
      ridetime: this.rideList[index].rideTime,
      rideid: this.rideList[index].rideId,
      paymentmethod: this.rideList[index].paymentMethod,
      servicetype: this.rideList[index].serviceType,
      sourceCity: this.rideList[index].sourceCity,
      driverName: this.rideList[index].driverName
        ? this.rideList[index].driverName
        : 'no Driver Assigned',
    });
    this.userProfile = `${environment.BASE_URL}${this.rideList[index].userProfile}`;

    let modal = bootstrap.Modal.getOrCreateInstance(
      document.getElementById('rideHistoryModal') as HTMLElement
    );
    modal.show();
  }
  onSearchInputChange(event: any) {
    if (event.target.value == '') {
      this.rideList = this.mainRideList;
    } else {
      let regEx = new RegExp(event.target.value, 'ig');
      let rideHistory = this.rideList.filter((ride) => {
        return (
          ride.source.search(regEx) > -1 ||
          ride.destination.search(regEx) > -1 ||
          ride.userName.search(regEx) > -1
        );
      });
      this.rideList = rideHistory;
    }
  }

  onDownload() {
    this.rideHistoryService.getRidesForDownload().subscribe({
      next: (data) => {
        this.csvExportService.downloadFile(data.rides);
      },
    });
  }

  onFromDateChange(event: any) {
    this.fromDate = new Date(event.target.value);
    let currentDate = new Date();
    if (this.fromDate > currentDate) {
      this.toasr.warning(
        'Date should not be greater than current date',
        'Warning',
        environment.TROASTR_STYLE
      );
      this.clearFrom();
    }
  }

  onToDateChange(event: any) {
    this.toDate = new Date(event.target.value);
    let currentDate = new Date();
    if (this.toDate > currentDate) {
      this.toasr.warning(
        'Date should not be greater than current date',
        'Warning',
        environment.TROASTR_STYLE
      );
      this.clearTo();
    }
  }

  onTypeChange(event: any) {
    this.selectedType = event.target.value;
  }

  onStatusChange(event: any) {
    this.selectedStatus = event.target.value;
  }
  onClickFilter() {
    let bool = false;
    let bool2 = false;
    let bool3 = false;
    if (this.toDate != undefined && this.fromDate != undefined) {
      if (this.toDate > this.fromDate) {
        this.rideList = this.mainRideList.filter((ride) => {
          let rideDate = new Date(ride.rideTime);
          if (this.fromDate! <= rideDate && this.toDate! >= rideDate) {
            bool = true;
          } else {
            bool = false;
          }
          if (this.selectedType != 'all') {
            bool2 = ride.serviceType == this.selectedType;
          } else {
            bool2 = true;
          }
          if (this.selectedStatus != 'all') {
            bool3 = ride.status == this.selectedStatus;
          } else {
            bool3 = true;
          }
          return bool && bool2 && bool3;
        });
      } else {
        this.toasr.warning(
          'To date should be greater than From date',
          'Warning',
          environment.TROASTR_STYLE
        );
        this.clearFrom();
        this.clearTo();
      }
    } else if (this.toDate == undefined && this.fromDate == undefined) {
      this.rideList = this.mainRideList.filter((ride) => {
        if (this.selectedType != 'all') {
          bool2 = ride.serviceType == this.selectedType;
        } else {
          bool2 = true;
        }
        if (this.selectedStatus != 'all') {
          bool3 = ride.status == this.selectedStatus;
        } else {
          bool3 = true;
        }
        return bool2 && bool3;
      });
    } else if (this.toDate == undefined || this.fromDate == undefined) {
      this.toasr.warning(
        'Please select both dates',
        'Warning',
        environment.TROASTR_STYLE
      );
    }
  }

  clearFrom() {
    let from = document.getElementById('from') as HTMLInputElement;
    from.value = '';
    this.fromDate = undefined;
  }
  clearTo() {
    let to = document.getElementById('to') as HTMLInputElement;
    to.value = '';
    this.toDate = undefined;
  }
}
