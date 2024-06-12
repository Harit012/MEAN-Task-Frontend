import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Country } from './country.interface';
import { CountriesService } from './countries.service';
import { AuthService } from '../../../auth/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-country',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './country.component.html',
  styleUrl: './country.component.css',
})
export class CountryComponent implements OnInit {
  countryForm: FormGroup;
  toBeAddedCountry: Country | null = null;
  AddedCountry: Country[] = [];
  filteredCountry: Country[] = [];
  countryname: string = '';
  countrycurrency: string = '';
  countrycallcode: string = '';
  toastr = inject(ToastrService);

  constructor(
    private countryService: CountriesService,
    private authService: AuthService
  ) {
    this.countryForm = new FormGroup({
      countryName: new FormControl(null, [Validators.required]),
      currency: new FormControl(null, [Validators.required]),
      countryCallCode: new FormControl(null, [Validators.required]),
    });
  }

  ngOnInit(): void {
    this.getCountries();
  }
  onSearchCountry() {
    let input = this.countryname;
    let searchRegEx = new RegExp(`^${input}$`, 'gi');
    this.countryService.getCountriesFromApi().subscribe({
      next: (data) => {
        for (let i = 0; i < data.length; i++) {
          if (data[i]['name']['common'].match(searchRegEx)) {
            let currencyRequirment = data[i]['currencies'];
            let countryCurrency = Object.keys(currencyRequirment).toString();
            let obj: Country = {
              countryName: data[i]['name']['common'],
              countryCallCode:
                data[i]['idd']['root'] + data[i]['idd']['suffixes'][0],
              currency:
                data[i]['currencies'][countryCurrency]['name'] +
                ` (${data[i]['currencies'][countryCurrency]['symbol']})`,
              timezones: data[i]['timezones'],
              FlagUrl: data[i]['flags']['png'],
              latlng: { lat: data[i]['latlng'][0], lng: data[i]['latlng'][1] },
              countryShortName: data[i]['cca2'],
            };
            // console.log(obj);
            this.countrycallcode = obj.countryCallCode;
            this.countrycurrency = obj.currency;
            this.toBeAddedCountry = obj;
            break;
          } else {
            continue;
          }
        }
        if (this.toBeAddedCountry == null) {
          this.toastr.error(`no country found with name ${input}`, 'Error');
          this.countryname = '';
          this.countryForm.reset();
        }
      },
      error: (err) => {
        this.toastr.error('Unable to connect with Countries API', 'Error');
      },
    });
  }
  onAddCountry() {
    if (!this.countryForm.invalid) {
      this.countryService
        .postCountry(this.toBeAddedCountry!)
        .subscribe({
          next:(res) => {
            if (res.country) {
              this.toastr.success(`Country ${res.country.countryName} added`, 'Success');
              this.filteredCountry.push(res.country);
              this.countryForm.reset();
              this.toBeAddedCountry = null;
            } 
            else if (res.varified == false) {
              this.authService.userLogOut();
            } 
            else if (res.error) {
              this.toBeAddedCountry = null;
              this.countryname = '';
              this.toastr.error(`Error From Backend:- ${res.error}`, 'Error');
            }
          },
          error: (err) => {
            this.toastr.error(`Unable to fetch data:- ${err.message}`, 'Error');
          },
        });
    } 
  }

  searchCountry(event: any) {
    const input = event.target.value;
    let serchregEx = new RegExp(input, 'gi');
    this.filteredCountry = this.AddedCountry.filter((country) =>
      country.countryName.match(serchregEx)
    );
  }

  getCountries() {
    this.countryService.getCountries().subscribe({
      next:(res) => {
        if (res.countries) {
          this.AddedCountry = res.countries;
          this.filteredCountry = res.countries;
        } else if (res.varified == false) {
          this.authService.userLogOut();
          return;
        } else if (res.error) {
          this.toastr.error(`Error From Backend:- ${res.error}`, 'Error');
        }
      },
      error: (err) => {
        this.toastr.error(`Unable to fetch data:- ${err.message}`, 'Error');
      },
    });
  }
}
