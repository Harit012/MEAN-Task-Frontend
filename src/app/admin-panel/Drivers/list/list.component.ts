import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CountriesService } from '../../Pricing/country/countries.service';
import { CityService } from '../../Pricing/city/city.service';
import { Country } from '../../Pricing/country/country.interface';
import { RecivingZone } from '../../Pricing/city/recivingZone.interface';
import { DriverService } from './driver.service';
import { Driver } from './driver.interface';
import * as bootstrap from 'bootstrap';
import { AuthService } from '../../../auth/auth.service';
@Component({
  selector: 'app-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './list.component.html',
  styleUrl: './list.component.css',
})
export class ListComponent implements OnInit {
  driverForm!: FormGroup;
  countryList: Country[] = [];
  cityList: RecivingZone[] = [];
  driversList: any[] = [];
  selectedCountry!: Country;
  selectedCity!: RecivingZone;
  countryCallCode!: string;
  currentSearch!: string;
  currentPage: number = 0;
  formdata = new FormData();
  editMode: boolean = false;
  sort: string = 'none';
  serviceTypes: string[] = ['none', 'SUV', 'SEDAN', 'MINI VAN', 'PICK UP'];
  selectedServiceType: string = 'none';
  driverForService!: Driver;
  constructor(
    private countryService: CountriesService,
    private cityService: CityService,
    private driverService: DriverService,
    private authService: AuthService
  ) {
    this.driverForm = new FormGroup({
      driverName: new FormControl(null, [Validators.required]),
      driverEmail: new FormControl(null, [
        Validators.required,
        Validators.email,
      ]),
      phone: new FormControl(null, [
        Validators.required,
        Validators.pattern('^[0-9]{10}$'),
        Validators.maxLength(10),
        Validators.minLength(10),
      ]),
      driverProfile: new FormControl(null, [Validators.required]),
      country: new FormControl(null, [Validators.required]),
      city: new FormControl(null, [Validators.required]),
    });
  }
  ngOnInit(): void {
    this.getDrivers();

    this.countryService.getCountries().subscribe((res) => {
      if (res.countries) {
        this.countryList = res.countries;
      }else if(res.varified === false){
        alert('User is not verified');
        this.authService.userLogOut();
      }
      else if(res.error){
        alert(res.error);
      }
    });
  }
  // when sort method changes
  onSortByChange(event: any) {
    this.sort = event.target.value;
    this.getDrivers();
  }
  // to retrive drivers data from server
  getDrivers() {
    this.driverService
      .getDrivers(this.currentPage, this.sort, this.currentSearch)
      .subscribe((res) => {
        if (res.drivers) {
          this.driversList = res.drivers;
        }else if(res.varified === false){
          alert('User is not verified');
          this.authService.userLogOut();
        }
        else if(res.error){
          alert(res.error);
        }
      });
  }
  // when user changes country
  onCountryChange(country: Country) {
    this.selectedCountry = country;
    this.countryCallCode = country.countryCallCode;
    this.cityService.getZones(country._id!).subscribe((data) => {
      if (data.zones) {
        this.cityList = data.zones;
      }else if(data.varified === false){
        alert('User is not verified');
        this.authService.userLogOut();
      }
      else if(data.error){
        alert(data.error);
      }
    });
  }
  // when user changes city
  onCityChange(city: RecivingZone) {
    this.selectedCity = city;
  }
  // ehwn user changes file
  onFileChange(event: any) {
    if (event.target.files && event.target.files.length) {
      if (event.target.files[0].size < 4000000) {
        this.formdata.append('driverProfile', event.target.files[0]);
      } else {
        return;
      }
    }
  }
  // when search input is changed
  onSearchInputChange(event: any) {
    this.currentSearch = event.target.value;
    this.getDrivers();
  }
  // to add user
  onAddDriver() {
    this.formdata.append(
      'driverName',
      this.driverForm.get('driverName')?.value
    );
    this.formdata.append(
      'driverEmail',
      this.driverForm.get('driverEmail')?.value
    );
    this.formdata.append('phone', this.driverForm.get('phone')?.value);
    this.formdata.append('country', this.selectedCountry._id!);
    this.formdata.append('city', this.selectedCity._id!);
    this.driverService.postDriver(this.formdata).subscribe((data) => {
      if (data.driver) {
        this.driversList.push(data.driver);
        this.formdata = new FormData();
        this.driverForm.reset();
      }else if(data.varified === false){
        this.formdata = new FormData();
        this.driverForm.reset();
        alert('User is not verified');
        this.authService.userLogOut();
      }
      else if(data.error){
        this.formdata = new FormData();
        this.driverForm.reset();
        alert(data.error);
      }
    });
  }
  // to update user
  onUpdateDriver() {
    this.formdata.append(
      'driverName',
      this.driverForm.get('driverName')?.value
    );
    this.formdata.append(
      'driverEmail',
      this.driverForm.get('driverEmail')?.value
    );
    this.formdata.append('phone', this.driverForm.get('phone')?.value);
    let temp_city = this.driverForm.get('city')?.value;
    for (let i = 0; i < this.cityList.length; i++) {
      if (this.cityList[i]['zoneName'] === temp_city) {
        this.formdata.append('city', this.cityList[i]['_id']!);
        break;
      } else {
        continue;
      }
    }
    this.formdata.append('country', this.selectedCountry._id!);
    this.driverService.putEditUser(this.formdata).subscribe((data) => {
      if (data.message) {
        this.getDrivers();
        this.formdata = new FormData();
        this.driverForm.reset();
        this.editMode = false;
      }else if(data.varified === false){
        alert('User is not verified');
        this.authService.userLogOut();
      }
      else if(data.error){
        this.formdata = new FormData();
        this.driverForm.reset();
        this.editMode = false;
        alert(data.error);
      }
    });
  }
  // to change driver approve status
  onApprove(i: number) {
    let temp_status: boolean = this.driversList[i]['approved'];
    temp_status = !temp_status;
    this.driverService
      .approvelChange(this.driversList[i]['_id'], temp_status)
      .subscribe((data) => {
        if (data.message) {
          this.getDrivers();
        }else if(data.varified === false){
          alert('User is not verified');
          this.authService.userLogOut();
        }
        else if(data.error){
          alert(data.error);
        }
      });
  }
  // to check form fields are valid or not
  isFieldInvalid(field: string): boolean {
    const control = this.driverForm.get(field);
    return control
      ? control.invalid && (control.dirty || control.touched)
      : false;
  }
  // when user selects action like edit / delete
  onActionSelect(event: any) {
    event.target.selectedIndex = 0;
  }
  // when user clicks on edit
  onEdit(driver: Driver) {
    this.formdata = new FormData();
    this.editMode = true;
    const modal = new bootstrap.Modal(
      document.getElementById('AddDriverModal') as HTMLElement
    );
    modal.show();
    this.driverForm.reset();
    let temp_countrycode = document.getElementById(
      'countrycode'
    ) as HTMLInputElement;
    let temp_country = document.getElementById('country') as HTMLSelectElement;
    let temp_city = document.getElementById('City') as HTMLSelectElement;
    let selectedDriverProfile = document.getElementById(
      'selectedDriverProfile'
    ) as HTMLElement;

    this.driverForm.patchValue({
      driverName: driver.driverName,
      driverEmail: driver.driverEmail,
      phone: driver.phone,
      city: driver.city,
    });
    temp_countrycode.value = driver.countryCode;
    selectedDriverProfile.innerText = driver.driverProfile.slice(
      21,
      driver.driverProfile.length
    );
    for (let j = 0; j < this.countryList.length; j++) {
      if (this.countryList[j].countryName == driver.countryName) {
        this.selectedCountry = this.countryList[j];
        temp_country.selectedIndex = j + 1;
        this.cityService
          .getZones(this.countryList[j]._id!)
          .subscribe((data) => {
            if (data.zones) {
              this.cityList = data.zones;
            }else if(data.varified === false){
              alert('User is not verified');
              this.authService.userLogOut();
            }
            else if(data.error){
              alert(data.error);
            }
          });
        break;
      } else {
        continue;
      }
    }

    this.formdata.append('driverProfile', driver.driverProfile);
    this.formdata.append('id', driver._id!);
  }
  // when user clicks on delete
  onDelete(driver: Driver) {
    if (confirm('Are you sure you want to delete this driver?')) {
      this.driverService.deleteDriver(driver._id!).subscribe((data) => {
        if (data.message) {
          let index = this.driversList.indexOf(driver);
          this.driversList.splice(index, 1);
        }else if(data.varified === false){
          alert('User is not verified');
          this.authService.userLogOut();
        }
        else if(data.error){
          alert(data.error);
        }
      });
    }
  }
  // when user wants to go to next page
  onNextPage() {
    if (this.driversList.length < 10) {
      alert('No more pages');
    } else {
      this.currentPage = this.currentPage + 1;
      this.getDrivers();
    }
  }
  // when user wants to go to previous page
  onPreviousPage() {
    if (this.currentPage > 0) {
      this.currentPage = this.currentPage - 1;
      this.getDrivers();
    } else {
      alert('Already on first page');
    }
  }
  // when user click service type
  serviceType(driver: Driver) {
    const modal = new bootstrap.Modal(
      document.getElementById('serviceTypeModal') as HTMLElement
    );
    modal.show();
    let ServiceType = document.getElementById(
      'ServiceType'
    ) as HTMLSelectElement;
    ServiceType.selectedIndex = this.serviceTypes.indexOf(driver.serviceType);
    this.driverForService = driver;
  }
  // when service type is changed by user
  serviceTypeChange(event: any) {
    this.selectedServiceType = event.target.value;
  }
  // to update service type
  onAddServiceType() {
    console.log(this.driverForService._id)
    this.driverService
      .patchServiceType(this.selectedServiceType, this.driverForService._id!)
      .subscribe((data) => {
        if(data.message){
          this.getDrivers();
        }else if(data.varified === false){
          alert('User is not verified');
          this.authService.userLogOut();
        }
        else if(data.error){
          alert(data.error);
        }
      });
  }
}
