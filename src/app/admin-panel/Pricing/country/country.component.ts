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
import { environment } from '../../../../environments/environment';

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

  onInputCountryName(event: Event) {
    this.countryname = (<HTMLInputElement>event.target).value;
  }
  onSearchCountry() {
    let input = this.countryname;
    let searchRegEx = new RegExp(`^${input}$`, 'gi');
    this.countryService.getCountriesFromApi().subscribe({
      next: (res) => {
        for(let data of res){
          if (data['name']['common'].match(searchRegEx)) {
            let currencyRequirment = data['currencies'];
            let countryCurrency = Object.keys(currencyRequirment).toString();
            let obj: Country = {
              countryName: data['name']['common'],
              currencyISOName: Object.keys(currencyRequirment).toString().toLowerCase(),
              countryCallCode:
                data['idd']['root'] + data['idd']['suffixes'][0],
              currency:
                data['currencies'][countryCurrency]['name'] +
                ` (${data['currencies'][countryCurrency]['symbol']})`,
              timezones: data['timezones'],
              FlagUrl: data['flags']['png'],
              latlng: { lat: data['latlng'][0], lng: data['latlng'][1] },
              countryShortName: data['cca2'],
            };
            this.countrycallcode = obj.countryCallCode;
            this.countrycurrency = obj.currency;
            this.toBeAddedCountry = obj;
            break;
          } else {
            continue;
          }
        }
        if (this.toBeAddedCountry == null) {
          this.toastr.error(`no country found with name ${input}`, 'Error',environment.TROASTR_STYLE);
          this.countryname = '';
          this.countryForm.reset();
        }
      },
      error: (err) => {
        this.toastr.error('Unable to connect with Countries API', 'Error',environment.TROASTR_STYLE);
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
              this.toastr.success(`Country ${res.country.countryName} added`, 'Success',environment.TROASTR_STYLE);
              this.filteredCountry.push(res.country);
              this.countryForm.reset();
              this.toBeAddedCountry = null;
            } 
          }
        });
    } 
  }

  searchCountry(event: any) {
    const input = event.target.value;
    let serchregEx = new RegExp(input, 'gi');
    this.filteredCountry = this.AddedCountry.filter((country) =>
      // country.countryName.match(serchregEx)
    RegExp(serchregEx).exec(country.countryName)

    );
  }

  getCountries() {
    this.countryService.getCountries().subscribe({
      next:(res) => {
        if (res.countries) {
          this.AddedCountry = res.countries;
          this.filteredCountry = res.countries;
        }
      }
    });
  }
}
