import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Country } from './country.interface';
import { HttpClient } from '@angular/common/http';
import { CountriesService } from './countries.service';
import { AuthService } from '../../../auth/auth.service';
import * as bootstrap from 'bootstrap';

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

  constructor(
    private http: HttpClient,
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
      this.countryService.getCountriesFromApi().subscribe((data) => {
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
          let toast = bootstrap.Toast.getOrCreateInstance(
            document.getElementById('FailureToast2') as HTMLElement
          );
          let inToast = document.getElementById(
            'inFailureToast2'
          ) as HTMLElement;
          inToast.innerText = "No country found with this name!";
          toast.show();
          this.countryname = '';
          this.countryForm.reset();
        }
      },(err)=>{
        console.log(err);
      });
  }
  onAddCountry() {
    if (!this.countryForm.invalid) {
      this.countryService.postCountry(this.toBeAddedCountry!).subscribe(
        (res) => {
          if (res.country) {
            let toast = bootstrap.Toast.getOrCreateInstance(
              document.getElementById('SuccessToast') as HTMLElement
            );
            let inToast = document.getElementById('inToast') as HTMLElement;
            inToast.innerText = 'country Added Successfully';
            toast.show();
            // console.log(res.country);
            // this.AddedCountry.push(res.country);
            this.filteredCountry.push(res.country);
            this.countryForm.reset();
            this.toBeAddedCountry = null;
          } else if(res.varified == false){
            // alert('User is not verified');
            this.authService.userLogOut();
          }
          else if(res.error){
            this.toBeAddedCountry = null;
            this.countryname = '';
            let toast = bootstrap.Toast.getOrCreateInstance(
              document.getElementById('FailureToast') as HTMLElement
            );
            let inToast = document.getElementById(
              'inFailureToast'
            ) as HTMLElement;
            inToast.innerText = res.error;
            toast.show();
          }
        }
      );
    } else {
      this.countryForm.reset();
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
    this.countryService.getCountries().subscribe((res) => {
      if (res.countries) {
        this.AddedCountry = res.countries;
        this.filteredCountry = res.countries;
      }else if (res.varified == false) {
        // alert('User is not verified');
        this.authService.userLogOut();
        return;
      } else if (res.error) {
        let toast = bootstrap.Toast.getOrCreateInstance(
          document.getElementById('FailureToast') as HTMLElement
        );
        let inToast = document.getElementById(
          'inFailureToast'
        ) as HTMLElement;
        inToast.innerText = res.error;
        toast.show();
      }
    });
  }
}
