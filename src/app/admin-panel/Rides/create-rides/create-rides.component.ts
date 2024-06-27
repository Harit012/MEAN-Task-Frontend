import { AfterViewInit, Component, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormArray,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../../../environments/environment';
import { CreateRidesService } from './create-rides.service';
import { AuthService } from '../../../auth/auth.service';
import { SettingsService } from '../../settings/settings.service';
import { Settings } from '../../settings/settings.interface';
import { UserGet } from '../../users/userGet.inerface';
import { VehicleTypeService } from '../../Pricing/vehicle-type/vehicle-type.service';

@Component({
  selector: 'app-create-rides',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-rides.component.html',
  styleUrl: './create-rides.component.css',
})
export class CreateRidesComponent implements OnInit , AfterViewInit {
  toastr: ToastrService = inject(ToastrService);
  rideForm: FormGroup;
  isVerified: boolean = false;
  settings!: Settings;
  serviceTypes!: string[];
  verifiedUser!: UserGet;
  map!: google.maps.Map;
  center!: google.maps.LatLngLiteral;
  markers: google.maps.marker.AdvancedMarkerElement[] = [];
  @ViewChild('source') source!: HTMLInputElement ;
  @ViewChild('destination') destination!: HTMLInputElement ;
  

  constructor(
    private createRideService: CreateRidesService,
    private authService: AuthService,
    private settingsService: SettingsService,
    private vehicleTypeService: VehicleTypeService
  ) {
    this.rideForm = new FormGroup({
      phone: new FormControl(null, [
        Validators.required,
        Validators.pattern('^[0-9]{10}$'),
        Validators.maxLength(10),
        Validators.minLength(10),
      ]),
      userName: new FormControl(null, [Validators.required]),
      userEmail: new FormControl(null, [Validators.required, Validators.email]),
      source: new FormControl(null, [Validators.required]),
      destination: new FormControl(null, [Validators.required]),
      stops: new FormArray([]),
      serviceType: new FormControl(null, [Validators.required]),
      paymentMethod: new FormControl(null, [Validators.required]),
    });
  }
  get stops(): FormArray {
    return this.rideForm.get('stops') as FormArray;
  }
  commonErrorHandler(err: any) {
    if (!err.error.status) {
      this.toastr.error(
        `Error while sending request to server`,
        `Error :- ${err.status}`,
        environment.TROASTR_STYLE
      );
    } else if (err.error.status == 'Failure') {
      if (err.status == 401) {
        this.authService.userLogOut();
      } else {
        this.toastr.error(
          `${err.error.message}`,
          `Error :- ${err.status}`,
          environment.TROASTR_STYLE
        );
      }
    } else {
      this.toastr.error(
        `Unknown Error`,
        `Error :- ${err.status}`,
        environment.TROASTR_STYLE
      );
    }
  }

  ngOnInit(): void {
    this.settingsService.getSettings().subscribe({
      next: (data) => {
        this.settings = data.settings;
      },
      error: (err) => this.commonErrorHandler(err),
    });
    this.vehicleTypeService.getAllVehicleTypes().subscribe({
      next: (data) => {
        this.serviceTypes = data.allVehicleTypes;
      },
      error: (err) => this.commonErrorHandler(err),
    });
  }

  ngAfterViewInit(): void {
    this.initMap();
    this.autocomplete();

  }
  
  initMap() {
    this.map = new google.maps.Map(
      document.getElementById('map') as HTMLElement,
      {
        center: { lat: 52.7572, lng: 12.8022 },
        zoom: 10,
        mapId:"8f2d9c7f9f9f8a9f",
        // styles: ,
      }
    );
  }
  onVerifyPhoneNumber() {
    if (this.rideForm.get('phone')?.valid) {
      let phone = this.rideForm.get('phone')?.value;
      this.createRideService.verifyPhoneNumber(phone).subscribe({
        next: (data) => {
          if (data.user != null) {
            this.isVerified = true;
            this.verifiedUser = data.user;
            this.rideForm.patchValue({
              userName: this.verifiedUser.userName,
              userEmail: this.verifiedUser.userEmail,
            });
            let temp_username = document.getElementById(
              'userName'
            ) as HTMLInputElement;
            let temp_useremail = document.getElementById(
              'userEmail'
            ) as HTMLInputElement;
            temp_username.value = this.verifiedUser.userName;
            temp_useremail.value = this.verifiedUser.userEmail;
            this.toastr.success(
              `Phone number matched with ${this.verifiedUser.userName.toUpperCase()}`,
              '',
              environment.TROASTR_STYLE
            );
          } else {
            this.toastr.warning(
              'No User Found',
              'Sorry',
              environment.TROASTR_STYLE
            );
          }
        },
        error: (err) => this.commonErrorHandler(err),
      });
    } else {
      this.toastr.error(
        'Phone number is not Valid',
        'Error',
        environment.TROASTR_STYLE
      );
    }
  }

  onAddStop() {
    if (this.stops.controls.length < this.settings.stops) {
      this.stops.push(new FormControl(null, [Validators.required]));
    } else {
      this.toastr.warning(
        `You can't add more than ${this.settings.stops} stops`,
        '',
        environment.TROASTR_STYLE
      );
    }
  }

  onRemoveStop(i: number) {
    this.stops.removeAt(i);
  }

  getCurrentLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        this.center = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        console.log(this.center);
        this.map.setCenter(this.center);
      });
    }
  }

  onCreateRide() {
    let invalidFields = [];
    if (this.rideForm.valid) {
      console.log(this.rideForm.value);
    }else{
      let controls = this.rideForm.controls;
      this.rideForm.markAsDirty();
      this.rideForm.markAllAsTouched();
      for( let key in controls){
        if(controls[key].invalid){
          invalidFields.push(key);
        }
        else{
          continue;
        }
      } 
      this.toastr.error('Invalid Fields: '+invalidFields+'', 'Error', environment.TROASTR_STYLE);
    }
  }

  autocomplete(){
    const autocompleteOptions = {
      componentRestrictions: { country: "in" },
      fields: ["address_components", "geometry", "name", "place_id"],
    };
    let autocomplete = new google.maps.places.Autocomplete(
      document.getElementById("source") as HTMLInputElement,
      autocompleteOptions
    );
    let autocomplete2 = new google.maps.places.Autocomplete(
      document.getElementById("destination") as HTMLInputElement,
      autocompleteOptions
    )
    
    autocomplete.addListener("place_changed", () => {
      let marker: google.maps.marker.AdvancedMarkerElement
      const place = autocomplete.getPlace();
      const placeGeo : google.maps.LatLngLiteral = {
        lat: place.geometry?.location?.lat()!,
        lng : place.geometry?.location?.lng()!
      }
      marker= new google.maps.marker.AdvancedMarkerElement({
        map: this.map,
        position: placeGeo,
        title: place.name,
        gmpDraggable:true,
      })
      marker.addListener("dragend",(event:any)=>{
        console.log(event)
      })
      // console.log(place)
      // console.log(this.markers)
      this.map.panTo(placeGeo)
    });

    autocomplete2.addListener("place_changed", () => {
      const place2 = autocomplete2.getPlace();
      
      const place2Geo : google.maps.LatLngLiteral = {
        lat: place2.geometry?.location?.lat()!,
        lng : place2.geometry?.location?.lng()!
      }
      this.markers[1]= new google.maps.marker.AdvancedMarkerElement({
        map: this.map,
        position: place2Geo,
        title: place2.name,
        gmpDraggable:true
      })
      this.markers.forEach((marker)=>{
        marker.addEventListener("dragend",(event:any)=>{
          console.log(event.latLng.lat());
        })
      })
      // console.log(place2)
      // console.log(this.markers)
      this.map.panTo(place2Geo)
    })
  }
}
