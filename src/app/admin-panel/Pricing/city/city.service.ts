import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Zone } from './zone.interface';
import { Params } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class CityService {
  constructor(private http: HttpClient) {}

  updateZone(obj: { boundry: google.maps.LatLngLiteral[]; id: string }) {
    return this.http.patch<{ zone: Zone; error: string }>(
      'http://localhost:3000/admin/pricing/city',
      obj,
      { withCredentials: true }
    );
  }
  addZone(zone: Zone) {
    return this.http.post<{ zones: Zone[]; error: string }>(
      'http://localhost:3000/admin/pricing/city',
      zone,
      {
        withCredentials: true,
      }
    );
  }
  getZones(csn: string) {
    const params: Params = {
      countryShortName: csn,
    };
    return this.http.get<{ zones: Zone[]; error: string }>(
      'http://localhost:3000/admin/pricing/city',
      { params: params, withCredentials: true }
    );
  }
}
