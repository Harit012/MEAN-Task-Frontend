import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Country } from './country.interface';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CountriesService {
  constructor(private http: HttpClient) {}

  getCountries() {
    return this.http.get<{ countries: Country[] ,status: string}>(
      `${environment.BASE_URL}/admin/pricing/country`,
      {
        withCredentials: true,
      }
    );
  }

  postCountry(country: Country) {
    return this.http.post<{ country: Country; status: string }>(
      `${environment.BASE_URL}/admin/pricing/country`,
      country,
      { withCredentials: true }
    );
  }

  getCountriesFromApi(){
    return this.http.get<any>('https://restcountries.com/v3.1/all')
  }
}
