import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConfirmedRide } from './confirmed-ride.interface';
import { environment } from '../../../../environments/environment';
import { retry } from 'rxjs';
import { RideDriver } from './RideDriver.interface';
import { Params } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class ConfirmedRidesService {
  constructor(private http: HttpClient) {}

  getAllDrivers(cityId: string, serviceType:string) {
    const params:Params  = { cityId: cityId, serviceType:serviceType };
    return this.http.get<{ status: string; driversList: RideDriver[] }>(
      `${environment.BASE_URL}/admin/rides/confirmed-ride/getAllDrivers`,
      {params: params}
    );
  }

  getRides() {
    return this.http.get<{ status: string; rides: ConfirmedRide[] }>(
      `${environment.BASE_URL}/admin/rides/confirmed-ride/getRides`
    );
  }

  cancleRide(rideId: string) {
    return this.http.patch<any>(
      `${environment.BASE_URL}/admin/rides/confirmed-ride/cancel-ride`,
      { rideId: rideId }
    );
  }

  assignDriver(rideId: string, driverId: string) {
    return this.http.patch<{ status: string; ride: ConfirmedRide }>(
      `${environment.BASE_URL}/admin/rides/confirmed-ride/assign-driver`,
      { rideId: rideId, driverId: driverId }
    );
  }
}
