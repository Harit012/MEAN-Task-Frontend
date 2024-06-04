import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Settings } from './settings.interface';

@Injectable({ providedIn: 'root' })
export class SettingsService {
  constructor(private http: HttpClient) {}

  putSettings(timeOut:number, stops:number) {
    let settings:Settings ={
      timeOut:timeOut,
      stops:stops
    }
    return this.http.patch<{ message:string; error: string }>(
      'http://localhost:3000/admin/settings/patchSettings',
       settings,
      {
        withCredentials: true,
      }
    );
  }

  getSettings() {
    return this.http.get<{ settings: Settings; error: string }>(
      'http://localhost:3000/admin/settings/getSettings',
      { withCredentials: true }
    );
  }
}
