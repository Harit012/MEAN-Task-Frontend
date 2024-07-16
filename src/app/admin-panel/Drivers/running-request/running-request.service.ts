import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { ConfirmedRide } from '../../Rides/confirmed-rides/confirmed-ride.interface';

@Injectable({ providedIn: 'root' })
export class RunningRequestService {
  constructor(private http: HttpClient) {}

  getRidesForRunningRequest() {
    return this.http.get<{ status: string; rides: ConfirmedRide[] }>(
      `${environment.BASE_URL}/admin/drivers/running-request/getRidesForRunningRequest`
    );
  }

  patchAcceptRide(rideId: string) {
    return this.http.patch<{ status: string; ride: ConfirmedRide }>(
      `${environment.BASE_URL}/admin/drivers/running-request/accept-ride`,
      { rideId: rideId }
    );
  }

  patchChangeStatus(rideId: string, status: string) {
    return this.http.patch<any>(
        `${environment.BASE_URL}/admin/drivers/running-request/statusChange`,
        { rideId: rideId, status: status }
    );
  }
}
