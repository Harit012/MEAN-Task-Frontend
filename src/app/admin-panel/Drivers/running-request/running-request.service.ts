import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { ConfirmedRide } from '../../Rides/confirmed-rides/confirmed-ride.interface';
import { Invoice } from './Invoice.inerface';

@Injectable({ providedIn: 'root' })
export class RunningRequestService {
  constructor(private http: HttpClient) {}

  getRidesForRunningRequest() {
    return this.http.get<{
      status: string;
      acceptedRides: ConfirmedRide[];
      newRides: ConfirmedRide[];
    }>(
      `${environment.BASE_URL}/admin/drivers/running-request/getRidesForRunningRequest`
    );
  }

  patchDriverResponse(rideId: string, response: number) {
    return this.http.patch<{ status: string; ride: ConfirmedRide }>(
      `${environment.BASE_URL}/admin/drivers/running-request/request-response`,
      { response: response, rideId: rideId }
    );
  }

  patchChangeStatus(rideId: string, status: string) {
    return this.http.patch<any>(
      `${environment.BASE_URL}/admin/drivers/running-request/statusChange`,
      { rideId: rideId, status: status }
    );
  }

  patchRemoveDriver(rideId: string) {
    return this.http.patch<{ status: boolean; ride: ConfirmedRide }>(
      `${environment.BASE_URL}/admin/drivers/running-request/remove-driver`,
      { rideId: rideId }
    );
  }

  patchBlockDriver(driverId: string, rideId: string) {
    return this.http.patch<{ status: boolean }>(
      `${environment.BASE_URL}/admin/drivers/running-request/bolck-driver`,
      { driverId: driverId, rideId: rideId }
    );
  }

  patchCompleteRide(rideId: string) {
    return this.http.patch<any>(
      `${environment.BASE_URL}/admin/drivers/running-request/complete-ride`,
      { rideId: rideId }
    );
  }

  postPaymentProcess(deatails: Invoice) {
    return this.http.post<{success:boolean; message?:string; link?:string}>(
      `${environment.BASE_URL}/admin/drivers/running-request/payment-process`,
      deatails
    );
  }
}
