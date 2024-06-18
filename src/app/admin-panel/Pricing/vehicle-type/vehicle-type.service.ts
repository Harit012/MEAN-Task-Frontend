import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { VehicleType } from './vehicle.interface';
import { Params } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class VehicleTypeService {
  constructor(private http: HttpClient) {}

  getVehicleTypes() {
    return this.http.get<{
      vehicle: VehicleType[];
      varified: boolean;
      error: string;
    }>('http://localhost:3000/admin/pricing/vehicle-type', {
      withCredentials: true,
    });
  }

  postVehicleType(vehicleType: FormData) {
    return this.http.post<{
      vehicles: VehicleType[];
      error: string;
      varified: boolean;
    }>('http://localhost:3000/admin/pricing/vehicle-type', vehicleType, {
      withCredentials: true,
    });
  }

  putVehicleType(vehicleType: FormData) {
    return this.http.put<{
      vehicles: VehicleType[];
      error: string;
      varified: boolean;
    }>('http://localhost:3000/admin/pricing/vehicle-type', vehicleType, {
      withCredentials: true,
    });
  }

  deleteVehicleType(id: string) {
    const params: Params = { id: id };
    return this.http.delete<{
      vehicles: VehicleType[];
      error: string;
      varified: boolean;
    }>('http://localhost:3000/admin/pricing/vehicle-type', {
      params: params,
      withCredentials: true,
    });
  }

  getAllVehicleTypes() {
    return this.http.get<{
      allVehicleTypes: string[];
      varified: boolean;
    }>('http://localhost:3000/admin/pricing/vehicle-type/getAllTypes', {
      withCredentials: true,
    });
  }
}
