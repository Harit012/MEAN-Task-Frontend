import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { VehicleType } from './vehicle.interface';
import { Params } from '@angular/router';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class VehicleTypeService {
  constructor(private http: HttpClient) {}

  getVehicleTypes() {
    return this.http.get<{
      vehicle: VehicleType[];
      status: string;
    }>(`${environment.BASE_URL}/admin/pricing/vehicle-type`, {
      withCredentials: true,
    });
  }

  postVehicleType(vehicleType: FormData) {
    return this.http.post<{
      vehicles: VehicleType[];
      status: string;
    }>(`${environment.BASE_URL}/admin/pricing/vehicle-type`, vehicleType, {
      withCredentials: true,
    });
  }

  putVehicleType(vehicleType: FormData) {
    return this.http.put<{
      vehicles: VehicleType[];
      status: string;
    }>(`${environment.BASE_URL}/admin/pricing/vehicle-type`, vehicleType, {
      withCredentials: true,
    });
  }

  deleteVehicleType(id: string) {
    const params: Params = { id: id };
    return this.http.delete<{
      vehicles: VehicleType[];
      status: string;
    }>(`${environment.BASE_URL}/admin/pricing/vehicle-type`, {
      params: params,
      withCredentials: true,
    });
  }

  getAllVehicleTypes() {
    return this.http.get<{
      allVehicleTypes: string[];
      varified: boolean;
    }>(`${environment.BASE_URL}/admin/pricing/vehicle-type/getAllTypes`, {
      withCredentials: true,
    });
  }
}
