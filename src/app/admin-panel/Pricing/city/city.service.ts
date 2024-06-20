import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Zone } from './zone.interface';
import { Params } from '@angular/router';
import { RecivingZone } from './recivingZone.interface';
import { RecivedCity } from '../vehicle-pricing/recivedcity.interface';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CityService {
  constructor(private http: HttpClient) {}

  updateZone(obj: { boundry: google.maps.LatLngLiteral[]; id: string }) {
    return this.http.patch<{ zone: RecivingZone; status: string}>(
      `${environment.BASE_URL}/admin/pricing/city`,
      obj,
      { withCredentials: true }
    );
  }
  addZone(zone: Zone) {
    return this.http.post<{ zones: RecivingZone[]; error: string ,varified: boolean}>(
      `${environment.BASE_URL}/admin/pricing/city`,
      zone,
      {
        withCredentials: true,
      }
    );
  }
  getZones(countryId: string) {
    const params: Params = {
      countryId: countryId,
    };
    return this.http.get<{ zones: RecivingZone[]; status: string}>(
      `${environment.BASE_URL}/admin/pricing/city`,
      { params: params, withCredentials: true }
    );
  }

  getZoneForPricing(cityId: string) {
    const params: Params = {
      cityId: cityId,
    };
    return this.http.get<RecivedCity>(
      `${environment.BASE_URL}/admin/pricing/cityForPricing`,
      {
        params: params,
        withCredentials: true,
      }
    );
  }
}
