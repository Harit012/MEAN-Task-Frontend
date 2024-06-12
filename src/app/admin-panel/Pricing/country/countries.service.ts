import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Country } from './country.interface';

@Injectable({
  providedIn: 'root',
})
export class CountriesService {
  constructor(private http: HttpClient) {}

  getCountries() {
    return this.http.get<{ countries: Country[] ,error: string,varified: boolean}>(
      'http://localhost:3000/admin/pricing/country',
      {
        withCredentials: true,
      }
    );
  }

  postCountry(country: Country) {
    return this.http.post<{ country: Country; error: string,varified: boolean }>(
      'http://localhost:3000/admin/pricing/country',
      country,
      { withCredentials: true }
    );
  }

  getCountriesFromApi(){
    return this.http.get<any>('https://restcountries.com/v3.1/all')
  }
}
