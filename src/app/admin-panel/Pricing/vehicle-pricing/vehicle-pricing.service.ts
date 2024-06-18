import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { VehiclePricing } from './vehicle-pricing.interface';
import { Params } from '@angular/router';

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

  getAvailableTypes(cityId:string) {
    const params: Params = {
      city: cityId
    }
    // const params: HttpParams = new HttpParams().append('city', cityId);
    // console.log(params);
    
    return this.http.get<{availableTypes:string[],varified: boolean;}>(
      'http://localhost:3000/admin/pricing/vehicle-pricing/getAvailableTypes',
      {params: params, withCredentials: true}
      // {withCredentials: true}
    )
  }
}
