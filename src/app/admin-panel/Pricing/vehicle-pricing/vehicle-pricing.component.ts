import { AfterViewChecked, ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CountriesService } from '../country/countries.service';
import { CommonModule } from '@angular/common';
import { CityService } from '../city/city.service';
import { Country } from '../country/country.interface';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { VehiclePricing } from './vehicle-pricing.interface';
import { RecivingZone } from '../city/recivingZone.interface';
import { AuthService } from '../../../auth/auth.service';
import { VehiclePricingService } from './vehicle-pricing.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-vehicle-pricing',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './vehicle-pricing.component.html',
  styleUrl: './vehicle-pricing.component.css',
})
export class VehiclePricingComponent implements OnInit, AfterViewChecked {
  countryList!: Country[];
  selectedCountry!: Country;
  cityList!: RecivingZone[];
  selectedCity!: RecivingZone;
  vehicleTypesList: string[] = [];
  selectefVehicleType!: string;
  vehiclePricingForm: FormGroup;
  pricingList!: VehiclePricing[];
  editMode: boolean = false;
  editIndex!: number;
  editabledocument!: VehiclePricing;
  numbers = [1, 2, 3, 4, 5];
  toastr = inject(ToastrService);

  constructor(
    private countryService: CountriesService,
    private cityService: CityService,
    private authService: AuthService,
    private vehiclePricingService: VehiclePricingService,
    private cdRef: ChangeDetectorRef
  ) {
    this.vehiclePricingForm = new FormGroup({
      driverProfit: new FormControl(null, [
        Validators.required,
        Validators.pattern('^[0-9]*$'),
      ]),
      minFare: new FormControl(null, [
        Validators.required,
        Validators.pattern('^[0-9]*$'),
      ]),
      distanceForBasePrice: new FormControl(0, [
        Validators.required,
        Validators.pattern('^[0-9]*$'),
      ]),
      basePrice: new FormControl(null, [
        Validators.required,
        Validators.pattern('^[0-9]*$'),
      ]),
      pricePerUnitDistance: new FormControl(null, [
        Validators.required,
        Validators.pattern('^[0-9]*$'),
      ]),
      pricePerUnitTime: new FormControl(null, [
        Validators.required,
        Validators.pattern('^[0-9]*$'),
      ]),
      maxSpace: new FormControl(null, [
        Validators.required,
        Validators.pattern('^[0-9]*$'),
      ]),
    });
  }

  ngOnInit(): void {
    this.countryService.getCountries().subscribe({
      next: (data) => {
        if (data.countries) {
          this.countryList = data.countries;
        } else if (data.varified == false) {
          this.authService.userLogOut();
        } else if (data.error) {
          this.toastr.error(`Error From Backend:- ${data.error}`, 'Error');
        }
      },
      error: (err) => {
        this.toastr.error(`Unable to Fetch data:- ${err.message}`, 'Error');
      },
    });

    this.vehiclePricingService.getVehiclePricing().subscribe({
      next: (data) => {
        if (data.vehiclePricing) {
          this.pricingList = data.vehiclePricing;
        } else if (data.varified == false) {
          this.authService.userLogOut();
        } else if (data.error) {
          this.toastr.error(`Error From Backend:- ${data.error}`, 'Error');
        }
      },
      error: (err) => {
        this.toastr.error(`Unable to Fetch data:- ${err.message}`, 'Error');
      },
    });
  }

  ngAfterViewChecked(): void {
    if (this.editMode) {
      let temp_country = document.getElementById('country') as HTMLInputElement;
      let temp_city = document.getElementById('city') as HTMLInputElement;
      let temp_vehicleType = document.getElementById(
        'vehicleType'
      ) as HTMLInputElement;
      temp_country.value = this.editabledocument.country;
      temp_city.value = this.editabledocument.city;
      temp_vehicleType.value = this.editabledocument.vehicleType;
    }
  }
  onCountryChange(country: Country) {
    this.selectedCountry = country;
    this.vehiclePricingForm.reset();
    this.cityService.getZones(country._id!).subscribe({
      next: (data) => {
        if (data.zones) {
          this.cityList = data.zones;
        } else if (data.varified == false) {
          this.authService.userLogOut();
        } else if (data.error) {
          this.toastr.error(`Error From Backend:- ${data.error}`, 'Error');
        }
      },
      error: (err) => {
        this.toastr.error(`Unable to Fetch data:- ${err.message}`, 'Error');
      },
    });
  }

  onCityChange(city: RecivingZone) {
    this.vehicleTypesList = [];
    this.vehiclePricingForm.reset();
    this.selectedCity = city;
    this.cityService.getZoneForPricing(city._id!).subscribe({
      next: (data) => {
        if (data.pricing) {
          let res = data.pricing;
          res.forEach((ele: any) => {
            if (!ele['hasvalue']) {
              this.vehicleTypesList.push(ele['vtype']);
            }
          });
        }
      },
      error: (err) => {
        this.toastr.error(`error :- ${err.message}`, 'Error');
      },
    });
  }

  onVehicleTypeChange(event: any) {
    this.selectefVehicleType = event.target.value;
    this.vehiclePricingForm.reset();
  }

  onSubmitVehicleForm() {
    if (this.vehiclePricingForm.valid) {
      let data: VehiclePricing = {
        country: this.selectedCountry._id!,
        city: this.selectedCity._id!,
        vehicleType: this.selectefVehicleType.toString(),
        ccv:
          this.selectedCity.zoneName +
          '_' +
          this.selectedCity.country.countryName +
          '_' +
          this.selectefVehicleType.toString(),
        ...this.vehiclePricingForm.value,
      };
      this.vehiclePricingService.postVehiclePricing(data).subscribe({
        next: (data) => {
          if (data.vehiclePricing) {
            this.pricingList.push(data.vehiclePricing);
            this.vehiclePricingForm.reset();
            this.vehicleTypesList = [];
            let tempcountry = document.getElementById(
              'country'
            ) as HTMLSelectElement;
            let tempcity = document.getElementById('city') as HTMLSelectElement;
            tempcountry.selectedIndex = 0;
            tempcity.selectedIndex = 0;
            this.cityList = [];
            this.toastr.success(`Vehicle Pricing Added`, 'Success');
          } else if (data.varified == false) {
            this.authService.userLogOut();
          } else if (data.error) {
            this.toastr.error(`Error From Backend:- ${data.error}`, 'Error');
          }
        },
        error: (err) => {
          this.toastr.error(`Unable to Fetch data:- ${err.message}`, 'Error');
        },
      });
    } else {
      this.toastr.error('Enter Valid Details', 'Error');
    }
  }
  onEdit(i: number) {
    this.editMode = true;
    this.editIndex = i;
    this.editabledocument = this.pricingList[i];
    this.cdRef.detectChanges();
    this.vehiclePricingForm.patchValue(this.editabledocument);
  }

  leaveEditMode() {
    this.editMode = false;
    this.vehiclePricingForm.reset();
  }
  onUpdate() {
    if (this.vehiclePricingForm.valid) {
      let data: VehiclePricing = this.vehiclePricingForm.value;
      data._id = this.editabledocument._id;
      this.vehiclePricingService.patchVehiclePricing(data).subscribe({
        next: (data) => {
          if (data.vehiclePricing) {
            this.pricingList[this.editIndex] = data.vehiclePricing;
            this.leaveEditMode();
            this.toastr.success(`Vehicle Pricing Updated`, 'Success');
          } else if (data.varified == false) {
            this.authService.userLogOut();
          } else if (data.error) {
            this.toastr.error(`Error From Backend:- ${data.error}`, 'Error');
          }
        },
        error: (err) => {
          this.toastr.error(`Unable to Fetch data:- ${err.message}`, 'Error');
        },
      });
    } else {
      this.toastr.error('Enter Valid Details', 'Error');
    }
  }
  // Method to check if a field is touched or dirty and invalid
  isFieldInvalid(field: string): boolean {
    const control = this.vehiclePricingForm.get(field);
    return control
      ? control.invalid && (control.dirty || control.touched)
      : false;
  }
}
