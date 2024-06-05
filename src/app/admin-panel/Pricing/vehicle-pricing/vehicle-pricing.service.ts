import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { VehiclePricing } from './vehicle-pricing.interface';

@Injectable({
  providedIn: 'root',
})
export class VehiclePricingService {
  constructor(private http: HttpClient) {}

  patchVehiclePricing(vehiclePricing: VehiclePricing) {
    return this.http.patch<{
      vehiclePricing: VehiclePricing;
      error: string;
      varified: boolean;
    }>(`http://localhost:3000/admin/pricing/vehicle-pricing`, vehiclePricing, {
      withCredentials: true,
    });
  }

  postVehiclePricing(vehiclePricing: VehiclePricing) {
    return this.http.post<{
      vehiclePricing: VehiclePricing;
      error: string;
      varified: boolean;
    }>('http://localhost:3000/admin/pricing/vehicle-pricing', vehiclePricing, {
      withCredentials: true,
    });
  }

  getVehiclePricing() {
    return this.http
    .get<{
      vehiclePricing: VehiclePricing[];
      error: string;
      varified: boolean;
    }>('http://localhost:3000/admin/pricing/vehicle-pricing', {
      withCredentials: true,
    })
  }
}
