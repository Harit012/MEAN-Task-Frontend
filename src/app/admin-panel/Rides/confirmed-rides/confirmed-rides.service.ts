import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConfirmedRide } from './confirmed-ride.interface';
import { environment } from '../../../../environments/environment';
import { RideDriver } from './RideDriver.interface';
import { Params } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class ConfirmedRidesService {
  constructor(private http: HttpClient) {}

  getAllDrivers(cityId: string, serviceType: string, rideId:string) {
    const params: Params = { cityId: cityId, serviceType: serviceType, rideId:rideId };
    return this.http.get<{ status: boolean; driversList: RideDriver[] }>(
      `${environment.BASE_URL}/admin/rides/confirmed-ride/getAllDrivers`,
      { params: params }
    );
  }

  getRides() {
    return this.http.get<{ status: boolean; rides: ConfirmedRide[] }>(
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
    return this.http.patch<{ status: boolean; ride: ConfirmedRide }>(
      `${environment.BASE_URL}/admin/rides/confirmed-ride/assign-driver`,
      { rideId: rideId, driverId: driverId }
    );
  }

  getTimeOut() {
    return this.http.get<{ status: boolean; timeOut: number }>(
      `${environment.BASE_URL}/admin/rides/confirmed-ride/getTimeOut`
    );
  }
}
