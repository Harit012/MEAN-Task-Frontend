import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Settings } from './settings.interface';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SettingsService {
  constructor(private http: HttpClient) {}

  putSettings(settings : Settings) {

    return this.http.patch<{ message:string; status: string }>(
      `${environment.BASE_URL}/admin/settings/patchSettings`,
       settings,
      {
        withCredentials: true,
      }
    );
  }

  getSettings() {
    return this.http.get<{ settings: Settings; status: string }>(
      `${environment.BASE_URL}/admin/settings/getSettings`,
      { withCredentials: true }
    );
  }
}
