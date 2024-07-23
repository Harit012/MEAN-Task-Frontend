import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { VerifiedUser } from '../../users/userGet.inerface';
import { BoxPricingContent } from './all.interface';

@Injectable({
  providedIn: 'root',
})
export class CreateRidesService {
  constructor(private http: HttpClient) {}

  verifyPhoneNumber(phone: string) {
    return this.http.post<{ user: VerifiedUser; status: string }>(
      `${environment.BASE_URL}/admin/rides/create-ride/VerifyUser`,
      { phone: phone }
    );
  }

  postCalculatPricing(zoneId: string, time: number, distance: number) {
    return this.http.post<{ status: string; prices: BoxPricingContent[] }>(
      `${environment.BASE_URL}/admin/rides/create-ride/calculate_pricings`,
      { zoneId: zoneId, time: time, distance: distance },
      { withCredentials: true }
    );
  }

  postRide(ride: object) {
    return this.http.post<{ status: string , message: string}>(
      `${environment.BASE_URL}/admin/rides/create-ride/create-ride`,
      ride,
      { withCredentials: true }
    );
  }
}
