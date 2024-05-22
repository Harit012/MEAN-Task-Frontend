import { Component, OnInit } from '@angular/core';
import { CountriesService } from '../country/countries.service';
import { CommonModule } from '@angular/common';
import { CityService } from '../city/city.service';
import { Country } from '../country/country.interface';
import { Zone } from '../city/zone.interface';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { VehiclePricing } from './vehicle-pricing.interface';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-vehicle-pricing',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './vehicle-pricing.component.html',
  styleUrl: './vehicle-pricing.component.css',
})
export class VehiclePricingComponent implements OnInit {
  countryList!: Country[];
  selectedCountry!: Country;
  cityList!: Zone[];
  selectedCity!: Zone;
  vehicleTypesList: string[] = ['SEDAN', 'SUV', 'MINI VAN', 'PICK UP'];
  selectefVehicleType!: string;
  vehiclePricingForm: FormGroup;

  constructor(
    private countryService: CountriesService,
    private cityService: CityService,
    private http: HttpClient
  ) {
    this.vehiclePricingForm = new FormGroup({
      driverProfit: new FormControl(null, [Validators.required]),
      minFare: new FormControl(null, [Validators.required]),
      distanceForBasePrice: new FormControl(null, [Validators.required]),
      basePrice: new FormControl(null, [Validators.required]),
      pricePerUnitDistance: new FormControl(null, [Validators.required]),
      pricePerUnitTime: new FormControl(null, [Validators.required]),
      maxSpace: new FormControl(null, [Validators.required]),
    });
  }

  ngOnInit(): void {
    this.countryService.getCountries().subscribe((data) => {
      if (data.countries) {
        this.countryList = data.countries;
      } else {
        alert(data.error);
      }
    });
  }
  onCountryChange(country: Country) {
    // this.selectedCountry = event.target.value;
    this.selectedCountry = country;
    this.vehiclePricingForm.reset();
    // console.log(country)
    this.cityService.getZones(country.countryShortName).subscribe((data) => {
      if (data.zones) {
        this.cityList = data.zones;
      } else {
        alert(data.error);
      }
    });
  }

  onCityChange(city: Zone) {
    this.vehiclePricingForm.reset();
    this.selectedCity = city;
    // console.log(this.selectedCity)
  }

  onVehicleTypeChange(event: any) {
    // console.log(this.selectefVehicleType)
    this.selectefVehicleType = event.target.value;
    this.vehiclePricingForm.reset();
  }

  onSubmitVehicleForm() {
    let data: VehiclePricing = {
      country: this.selectedCountry._id!,
      city: this.selectedCity._id!,
      vehicleType: this.selectefVehicleType.toString(),
      ...this.vehiclePricingForm.value,
    };
    this.http
      .post<VehiclePricing>(
        'http://localhost:3000/admin/pricing/vehicle-pricing',
        data
      )
      .subscribe((data) => {
        console.log(data)
      });
    console.log(data);
  }
}
