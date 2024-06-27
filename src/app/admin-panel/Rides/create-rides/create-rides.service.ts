import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { UserGet } from '../../users/userGet.inerface';

@Injectable({
  providedIn: 'root',
})
export class CreateRidesService {
  constructor(private http: HttpClient) {}

  verifyPhoneNumber(phone: string) {
    return this.http.post<{ user: UserGet; status: string }>(
      `${environment.BASE_URL}/admin/rides/create-ride/VerifyUser`,
      {phone : phone},
    );
  }
}
