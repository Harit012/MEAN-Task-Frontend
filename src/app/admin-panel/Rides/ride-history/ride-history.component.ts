import { Component, OnInit } from '@angular/core';
import { RideSocketService } from '../services/ride-socket.service';
import { RideHistoryService } from './ride-history.service';
import { ConfirmedRide } from '../confirmed-rides/confirmed-ride.interface';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import * as bootstrap from 'bootstrap';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-ride-history',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './ride-history.component.html',
  styleUrl: './ride-history.component.css',
})
export class RideHistoryComponent implements OnInit {
  rideList: ConfirmedRide[] = [];
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

  // map element

  map!: google.maps.Map;
  endPoints: google.maps.LatLngLiteral[] = [];

  constructor(
    private rideSocketService: RideSocketService,
    private rideHistoryService: RideHistoryService
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
        this.rideList = data.rides;
      },
    });

    this.rideSocketService.cancleRide().subscribe((data: any) => {
      this.rideList.unshift(data);
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
    // let coordinates: google.maps.LatLngLiteral[] = [];
    // this.endPoints.forEach((point) => {
    //   coordinates.push({lat: point.lat, lng: point.lng});
    // });
    // console.log(coordinates);
    let polyLine = new google.maps.Polyline({
      // path: coordinates,
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
}
