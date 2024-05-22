import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Country } from './country.interface';

@Injectable({
  providedIn: 'root',
})
export class CountriesService {
  constructor(private http: HttpClient) {}

  getCountries() {
    return this.http.get<{ countries: Country[] ,error: string}>(
      'http://localhost:3000/admin/pricing/country',
      {
        withCredentials: true,
      }
    );
  }

  postCountry(country: Country) {
    return this.http.post<{ country: Country; error: any }>(
      'http://localhost:3000/admin/pricing/country',
      country,
      { withCredentials: true }
    );
  }
}
