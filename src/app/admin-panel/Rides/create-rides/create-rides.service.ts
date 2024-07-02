import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { VerifiedUser } from '../../users/userGet.inerface';
import { VehiclePricingInterface } from './all.interface';

@Injectable({
  providedIn: 'root',
})
export class CreateRidesService {
  constructor(private http: HttpClient) {}

  verifyPhoneNumber(phone: string) {
    return this.http.post<{ user: VerifiedUser; status: string }>(
      `${environment.BASE_URL}/admin/rides/create-ride/VerifyUser`,
      {phone : phone},
    );
  }

  getVehiclePricings(cityId: string) {
    return this.http.get<{status:string,pricings:VehiclePricingInterface[]}>(`${environment.BASE_URL}/admin/rides/create-ride/getPricings`,
      {withCredentials:true, params: {city: cityId}}
    )
  }
}
