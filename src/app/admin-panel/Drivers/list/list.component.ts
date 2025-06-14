import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
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
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../../../environments/environment';
import { VehicleTypeService } from '../../Pricing/vehicle-type/vehicle-type.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './list.component.html',
  styleUrl: './list.component.css',
})
export class ListComponent implements OnInit {
  driverForm: FormGroup;
  bankAccountForm: FormGroup;
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
  serviceTypes: string[] = ['none'];
  selectedServiceType: string = 'none';
  driverForService!: Driver;
  driverForAccount!: Driver;
  toastr = inject(ToastrService);
  constructor(
    private countryService: CountriesService,
    private cityService: CityService,
    private driverService: DriverService,
    private authService: AuthService,
    private vehicletypeService: VehicleTypeService
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
    this.bankAccountForm = new FormGroup({
      accountNumber: new FormControl(null, [
        Validators.required,
        Validators.maxLength(12),
        Validators.minLength(12),
        Validators.pattern('^[0-9]{12}$'),
      ]),
      routingNumber: new FormControl(null, [
        Validators.required,
        Validators.maxLength(9),
        Validators.minLength(9),
        Validators.pattern('^[0-9]{9}$'),
      ]),
    });
  }

  ngOnInit(): void {
    this.getDrivers();

    this.countryService.getCountries().subscribe({
      next: (res) => {
        if (res.countries) {
          this.countryList = res.countries;
        }
      },
    });

    this.vehicletypeService.getAllVehicleTypes().subscribe({
      next: (data) => {
        if (data.allVehicleTypes) {
          this.serviceTypes = ['none', ...data.allVehicleTypes];
        } else if (data.varified === false) {
          this.authService.userLogOut();
        }
      },
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
      .subscribe({
        next: (res) => {
          if (res.drivers) {
            this.driversList = res.drivers;
          }
        },
      });
  }
  // when user changes country

  preOnCountryChange(event: any) {
    let index = this.countryList.findIndex(
      (X) => X.countryName == event.target.value
    );
    if (index != -1) {
      this.onCountryChange(this.countryList[index]);
    }
  }

  onCountryChange(country: Country) {
    this.selectedCountry = country;
    this.countryCallCode = country.countryCallCode;
    this.cityService.getZones(country._id!).subscribe({
      next: (data) => {
        if (data.zones) {
          this.cityList = data.zones;
        }
      },
    });
  }

  preonCityChange(event: any) {
    let index = this.cityList.findIndex(
      (X) => X.zoneName == event.target.value
    );
    if (index != -1) {
      this.onCityChange(this.cityList[index]);
    }
  }
  // when user changes city
  onCityChange(city: RecivingZone) {
    this.selectedCity = city;
  }
  // ehwn user changes file
  onFileChange(event: any) {
    let files = event.target.files;
    let length = event.target.files.length;
    if (files && length) {
      if (
        event.target.files[0].type != 'image/png' &&
        event.target.files[0].type != 'image/jpeg'
      ) {
        this.toastr.warning(
          `${event.target.files[0].type} is not supported Upload Image/png`,
          'Warning',
          environment.TROASTR_STYLE
        );
      }
      if (event.target.files[0].size < 4000000) {
        this.formdata.delete('driverProfile');
        this.formdata.append('driverProfile', event.target.files[0]);
      } else {
        this.toastr.warning(
          'Upload file size is too large',
          'Warning',
          environment.TROASTR_STYLE
        );
        this.driverForm.get('driverProfile')?.setValue(null);
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
    this.formdata.append('city', this.selectedCity._id);
    this.driverService.postDriver(this.formdata).subscribe({
      next: (data) => {
        if (data.driver) {
          this.toastr.success(
            'Driver Added Successfully',
            'Success',
            environment.TROASTR_STYLE
          );
          this.driversList.push(data.driver);
          this.formdata = new FormData();
          this.driverForm.reset();
        }
      },
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
    for (let city of this.cityList) {
      if (city['zoneName'] === temp_city) {
        this.formdata.append('city', city._id);
        break;
      } else {
        continue;
      }
    }
    this.formdata.append('country', this.selectedCountry._id!);
    if (this.driverForm.dirty) {
      this.driverService.putEditUser(this.formdata).subscribe({
        next: (data) => {
          if (data.message) {
            this.getDrivers();
            this.formdata = new FormData();
            this.driverForm.reset();
            this.editMode = false;
            this.toastr.success(
              'Driver Updated Successfully',
              'Success',
              environment.TROASTR_STYLE
            );
          }
        },
      });
    } else {
      this.toastr.info(
        'No Changes Has Been Made',
        'Info',
        environment.TROASTR_STYLE
      );
    }
  }
  // to change driver approve status
  onApprove(i: number) {
    let temp_status: boolean = this.driversList[i]['approved'];
    temp_status = !temp_status;
    this.driverService
      .approvelChange(this.driversList[i]['_id'], temp_status)
      .subscribe({
        next: (data) => {
          if (data.message) {
            this.driversList[i]['approved'] = temp_status;
          }
        },
      });
  }
  // when user selects action like edit / delete
  onActionSelect(event: any, driver: Driver) {
    switch (event.target.value) {
      case 'edit':
        this.onEdit(driver);
        break;
      case 'delete':
        this.onDelete(driver);
        break;
      case 'serviceType':
        this.serviceType(driver);
        break;
      case 'bankAccount':
        this.onBankAccountModal(driver);
        break;
    }
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
    // let temp_city = document.getElementById('city') as HTMLSelectElement;
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
        this.cityService.getZones(this.countryList[j]._id!).subscribe({
          next: (data) => {
            if (data.zones) {
              this.cityList = data.zones;
            }
          },
        });
        break;
      } else {
        continue;
      }
    }
    // // for (let city of this.cityList){
    // //   if(city.zoneName == driver.city){
    // //     console.log("-----------------------------------------------------------")
    // //     console.log(temp_city.options)
    // //     console.log("-----------------------------------------------------------")
    // //     let ind = this.cityList.indexOf(city)+1;
    // //     temp_city.selectedIndex =ind;
    // //     break;
    // //   }else{
    // //     console.log(city.zoneName)
    // //     console.log(driver.city)
    // //     console.log("-------------------------------")
    // //     console.log(city.zoneName);
    // //   }
    // // }
    this.formdata.append('oldDriverProfile', driver.driverProfile);
    this.formdata.append('id', driver._id!);
  }
  // when user clicks on delete
  onDelete(driver: Driver) {
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: "btn btn-success",
        cancelButton: "btn btn-danger"
      },
      buttonsStyling: true
    });
    swalWithBootstrapButtons.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Reset it!",
      cancelButtonText: "No, cancel!",
      reverseButtons: true,
      showClass: {
        popup: `
          animate__animated
          animate__fadeInDown
          animate__fast
        `
      },
      hideClass: {
        popup: `
          animate__animated
          animate__fadeOutDown
          animate__faster
        `
      }
    }).then((result) => {
      if (result.isConfirmed) {
        this.driverService
        .deleteDriver(driver._id!, driver.driver_stripe_id!)
        .subscribe({
          next: (data) => {
            if (data.message) {
              this.toastr.success(
                'Driver Deleted Successfully',
                'Success',
                environment.TROASTR_STYLE
              );
              let index = this.driversList.indexOf(driver);
              this.driversList.splice(index, 1);
            }
          },
        });
      }
    });
  }
  // when user wants to go to next page
  onNextPage() {
    if (this.driversList.length < 10) {
      this.toastr.warning(
        'Already on Last Page',
        'Warning',
        environment.TROASTR_STYLE
      );
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
      this.toastr.warning(
        'Already on First Page',
        'Warning',
        environment.TROASTR_STYLE
      );
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
    this.driverService
      .patchServiceType(this.selectedServiceType, this.driverForService._id!)
      .subscribe({
        next: (data) => {
          if (data.message) {
            this.toastr.success(
              `${data.message}`,
              'Success',
              environment.TROASTR_STYLE
            );
            this.getDrivers();
          }
        },
      });
  }
  // onBankAccountModal
  onBankAccountModal(driver: Driver) {
    this.driverService.getAllAccounts(driver.driver_stripe_id!).subscribe({
      next: (data: any) => {
        let capabilities = data.capabilities;
        if (
          capabilities.card_payments == 'active' &&
          capabilities.transfers == 'active'
        ) {
          this.toastr.info(
            'You Already have Bank Account',
            '',
            environment.TROASTR_STYLE
          );
        } else if (
          capabilities.card_payments == 'pending' ||
          capabilities.transfers == 'pending'
        ) {
          this.toastr.info(
            'Your Bank Account request is in verification stage',
            '',
            environment.TROASTR_STYLE
          );
        } else {
          this.driverForAccount = driver;
          const modal = new bootstrap.Modal(
            document.getElementById('bankAccountModal') as HTMLElement
          );
          modal.show();
        }
      },
    });
    // this.driverForAccount = driver;
    // const modal = new bootstrap.Modal(
    //   document.getElementById('bankAccountModal') as HTMLElement
    // );
    // modal.show();
  }

  onAddBankAccount() {
    if (this.bankAccountForm.valid) {
      let AccountObj = {
        accountNumber: this.bankAccountForm.value.accountNumber,
        routingNumber: this.bankAccountForm.value.routingNumber,
        driverId: this.driverForAccount._id,
      };
      this.driverService.addBankAccount(AccountObj).subscribe({
        next: (data) => {
          const modal = document.getElementById("closeButtonOfAccountModal") as HTMLButtonElement;
          modal.click();  
          this.toastr.success(
            `Account Added it will take some time to verify`,
            '',
            environment.TROASTR_STYLE
          );
          this.bankAccountForm.reset();
        },
      });
    } else {
      this.toastr.error(
        `Please Enter Valid Details`,
        'Error',
        environment.TROASTR_STYLE
      );
      this.bankAccountForm.markAllAsTouched();
    }
  }

  allowOnlyDigits(event: KeyboardEvent) {
    if (!/^\d+$/.test(event.key) && event.key !== 'Backspace' && event.key !== 'Tab') {
      event.preventDefault();
    }
  }
}
