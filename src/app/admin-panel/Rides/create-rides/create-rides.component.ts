import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnInit,
  inject,
} from '@angular/core';
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
import { SettingsService } from '../../settings/settings.service';
import { Settings } from '../../settings/settings.interface';
import { VerifiedUser } from '../../users/userGet.inerface';
import { VehicleTypeService } from '../../Pricing/vehicle-type/vehicle-type.service';
import { CityService } from '../../Pricing/city/city.service';
import { RecivingZone } from '../../Pricing/city/recivingZone.interface';
import { BoxPricingContent } from './all.interface';
import * as bootstrap from 'bootstrap';

@Component({
  selector: 'app-create-rides',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-rides.component.html',
  styleUrl: './create-rides.component.css',
})
export class CreateRidesComponent implements OnInit, AfterViewInit {
  toastr: ToastrService = inject(ToastrService);
  rideForm: FormGroup;
  isVerified: boolean = false;
  settings!: Settings;
  verifiedUser!: VerifiedUser;
  zones!: RecivingZone[];
  autocompleteCountry!: string;
  sourceZoneId!: string;
  currency!: string;
  isCalulated: boolean = false;
  vehiclePricings: BoxPricingContent[] = [];
  estimatedDistance!: string;
  estimatedTime!: string;

  // For Map
  map!: google.maps.Map;
  sourceLatLng!: google.maps.LatLngLiteral;
  destinationLatLng!: google.maps.LatLngLiteral;
  center!: google.maps.LatLngLiteral;
  markers: google.maps.marker.AdvancedMarkerElement[] = [];
  stopMarkers: google.maps.marker.AdvancedMarkerElement[] = [];
  stopLatLngs: google.maps.LatLngLiteral[] = [];
  autocompleteOptions!: google.maps.places.AutocompleteOptions;
  autoComplete1!: google.maps.places.Autocomplete;
  autoComplete2!: google.maps.places.Autocomplete;
  autoComplete3!: google.maps.places.Autocomplete;
  sourcePin!: google.maps.marker.PinElement;
  destinationPin!: google.maps.marker.PinElement;
  stopsPin!: google.maps.marker.PinElement;
  directionsRenderer = new google.maps.DirectionsRenderer({
    hideRouteList: true,
    polylineOptions: {
      strokeColor: 'green',
      strokeOpacity: 1,
      strokeWeight: 3,
    },
  });

  constructor(
    private createRideService: CreateRidesService,
    private settingsService: SettingsService,
    private vehicleTypeService: VehicleTypeService,
    private cityService: CityService,
    private cdRef: ChangeDetectorRef
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
      rideTime: new FormControl(null, [Validators.required]),
    });
  }
  get stops(): FormArray {
    return this.rideForm.get('stops') as FormArray;
  }

  ngOnInit(): void {
    this.settingsService.getSettings().subscribe({
      next: (data) => {
        this.settings = data.settings;
      },
    });
  }

  ngAfterViewInit(): void {
    this.initMap();
  }
  // to initialize map
  initMap() {
    this.map = new google.maps.Map(
      document.getElementById('map') as HTMLElement,
      {
        center: { lat: 52.7572, lng: 12.8022 },
        zoom: 10,
        mapId: '8f2d9c7f9f9f8a9f',
      }
    );
  }
  // to Verify user from phone number
  onVerifyPhoneNumber() {
    if (this.rideForm.get('phone')?.valid) {
      let phone = this.rideForm.get('phone')?.value;
      this.createRideService.verifyPhoneNumber(phone).subscribe({
        next: (data) => {
          if (data.user != null) {
            this.isVerified = true;
            this.verifiedUser = data.user;
            this.currency = this.verifiedUser.country.currency.slice(
              this.verifiedUser.country.currency.indexOf('(') + 1,
              this.verifiedUser.country.currency.indexOf(')')
            );
            this.autocompleteCountry =
              this.verifiedUser.country.countryShortName;
            this.rideForm.patchValue({
              userName: this.verifiedUser.userName,
              userEmail: this.verifiedUser.userEmail,
            });
            let temp_username = document.getElementById(
              'userName'
            ) as HTMLElement;
            let temp_useremail = document.getElementById(
              'userEmail'
            ) as HTMLInputElement;
            temp_username.innerText = this.verifiedUser.userName;
            temp_useremail.innerText = this.verifiedUser.userEmail;
            this.toastr.success(
              `Phone number matched with ${this.verifiedUser.userName.toUpperCase()}`,
              '',
              environment.TROASTR_STYLE
            );
            this.cityService.getZones(this.verifiedUser.country._id).subscribe({
              next: (data) => {
                this.zones = data.zones;
              },
            });
            this.autocomplete();
          } else {
            this.toastr.warning(
              'No User Found',
              'Sorry',
              environment.TROASTR_STYLE
            );
          }
        },
      });
    } else {
      this.toastr.error(
        'Phone number is not Valid',
        'Error',
        environment.TROASTR_STYLE
      );
    }
  }
  // to add a stop in formArray
  onAddStop() {
    if (this.stops.controls.length < this.settings.stops) {
      this.stops.push(new FormControl(null, [Validators.required]));
      this.cdRef.detectChanges();
      let temp_stop = document.getElementById(
        `${this.stops.controls.length - 1}`
      );
      let autocomplete = new google.maps.places.Autocomplete(
        temp_stop as HTMLInputElement,
        this.autocompleteOptions
      );
      autocomplete.addListener('place_changed', () => {
        this.stopsPin = new google.maps.marker.PinElement({
          scale: 1.2,
          borderColor: 'blue',
          background: 'red',
          // glyph: '🚗',
          glyphColor: 'blue',
        });
        let marker = new google.maps.marker.AdvancedMarkerElement;
        let stopGeo : google.maps.LatLngLiteral;
        let stop = autocomplete.getPlace();
        stopGeo= {
          lat : stop.geometry?.location?.lat()!,
          lng : stop.geometry?.location?.lng()!
        };
        marker = new google.maps.marker.AdvancedMarkerElement({
          position: stopGeo,
          title: stop.name,
          gmpDraggable: true,
          content: this.stopsPin.element,
        })
        this.stopMarkers[this.stops.controls.length - 1] = marker;
        this.stopLatLngs[this.stops.controls.length - 1] = stopGeo;
        console.log(this.stopMarkers)
        console.log(this.stopLatLngs)
      })
    } else {
      this.toastr.warning(
        `You can't add more than ${this.settings.stops} stops`,
        '',
        environment.TROASTR_STYLE
      );
    }
  }
  // to remove a stop from formArray
  onRemoveStop(i: number) {
    this.stops.removeAt(i);
  }
  // to get current location
  getCurrentLocation() {
    console.log(navigator.geolocation);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        this.center = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        this.map.setCenter(this.center);
        this.isCurrentLocationValid();
      });
    } else {
      this.toastr.info(
        'Geolocation is not supported by this browser',
        'Info',
        environment.TROASTR_STYLE
      );
    }
  }
  // to check if current location is valid or not
  isCurrentLocationValid() {
    let marker: google.maps.marker.AdvancedMarkerElement;
    let geocoder = new google.maps.Geocoder();
    let temp_source = document.getElementById('source') as HTMLInputElement;
    let zoneName = 'none';
    for (let zone of this.zones) {
      const polygon = new google.maps.Polygon({
        paths: zone.boundry,
      });
      let isInside = google.maps.geometry.poly.containsLocation(
        this.center,
        polygon
      );
      if (isInside) {
        zoneName = zone.zoneName;
        this.sourceZoneId = zone._id;
      } else {
        continue;
      }
    }
    if (zoneName != 'none') {
      geocoder.geocode({ location: this.center }).then((result: any) => {
        this.rideForm.patchValue({
          source: result.results[0].formatted_address,
        });
        temp_source.innerHTML = result.results[0].formatted_address;
      });
      marker = new google.maps.marker.AdvancedMarkerElement({
        map: this.map,
        position: this.center,
        title: temp_source.innerHTML,
        gmpDraggable: true,
        content: this.sourcePin.element,
      });
      this.sourceLatLng = this.center;
      this.markers[0] = marker;
    } else {
      this.toastr.info(
        `Sorry we are not yet available in Your Current location`,
        'Info',
        environment.TROASTR_STYLE
      );
    }
  }
  // on submit the form
  onCreateRide() {
    let invalidFields = [];
    if (this.rideForm.valid) {
      console.log(this.rideForm.value);
    } else {
      let controls = this.rideForm.controls;
      this.rideForm.markAsDirty();
      this.rideForm.markAllAsTouched();
      for (let key in controls) {
        if (controls[key].invalid) {
          invalidFields.push(key);
        } else {
          continue;
        }
      }
      this.toastr.error(
        'Invalid Fields: ' + invalidFields + '',
        'Error',
        environment.TROASTR_STYLE
      );
    }
  }
  // Autocomplete for source And Destination
  autocomplete() {
    this.autocompleteOptions = {
      componentRestrictions: { country: this.autocompleteCountry },
      types: ['address'],

      fields: ['address_components', 'geometry', 'name', 'place_id'],
    };
    this.sourcePin = new google.maps.marker.PinElement({
      scale: 1.2,
      borderColor: 'blue',
      background: 'yellow',
      // glyph: '🚗',
      glyphColor: 'blue',
    });
    this.destinationPin = new google.maps.marker.PinElement({
      scale: 1.2,
      borderColor: 'blue',
      background: 'green',
      // glyph: '🚗',
      glyphColor: 'yellow',
    });
    this.autoComplete1 = new google.maps.places.Autocomplete(
      document.getElementById('source') as HTMLInputElement,
      this.autocompleteOptions
    );
    this.autoComplete2 = new google.maps.places.Autocomplete(
      document.getElementById('destination') as HTMLInputElement,
      this.autocompleteOptions
    );

    // onSourceChange
    this.onSourceChange();

    // onDestinationChange
    this.onDestinationChange();

    // onStopChange
  }

  // triggered when Source is Changed
  onSourceChange() {
    this.autoComplete1.addListener('place_changed', () => {
      let zoneName = 'none';
      let marker: google.maps.marker.AdvancedMarkerElement;
      const place = this.autoComplete1.getPlace();
      let bounds = new google.maps.LatLngBounds();

      const placeGeo: google.maps.LatLngLiteral = {
        lat: place.geometry?.location?.lat()!,
        lng: place.geometry?.location?.lng()!,
      };
      for (let zone of this.zones) {
        const polygon = new google.maps.Polygon({
          paths: zone.boundry,
        });
        let isInside = google.maps.geometry.poly.containsLocation(
          placeGeo,
          polygon
        );
        if (isInside) {
          zoneName = zone.zoneName;
          this.sourceZoneId = zone._id;
        } else {
          continue;
        }
      }
      if (zoneName != 'none') {
        marker = new google.maps.marker.AdvancedMarkerElement({
          map: this.map,
          position: placeGeo,
          title: place.name,
          gmpDraggable: true,
          content: this.sourcePin.element,
        });
        this.rideForm.patchValue({ source: place.name });
        this.markers[0] = marker;
        this.map.panTo(placeGeo);
        this.sourceLatLng = placeGeo;
        this.markers.forEach((marker) => {
          bounds.extend(marker.position!);
        });
        this.map.fitBounds(bounds);
      } else {
        this.toastr.info(
          `Sorry we are not yet available in ${place.name}`,
          'Info',
          environment.TROASTR_STYLE
        );
        let temp_source = document.getElementById('source') as HTMLInputElement;
        temp_source.value = '';
      }
    });
  }
  // triggers when Destination is changed
  onDestinationChange() {
    // let temp_destination = document.getElementById('destination') as HTMLInputElement;
    this.autoComplete2.addListener('place_changed', () => {
      let marker: google.maps.marker.AdvancedMarkerElement;
      const place2 = this.autoComplete2.getPlace();
      let bounds = new google.maps.LatLngBounds();

      const place2Geo: google.maps.LatLngLiteral = {
        lat: place2.geometry?.location?.lat()!,
        lng: place2.geometry?.location?.lng()!,
      };
      marker = new google.maps.marker.AdvancedMarkerElement({
        map: this.map,
        position: place2Geo,
        title: place2.name,
        gmpDraggable: true,
        content: this.destinationPin.element,
      });
      this.rideForm.patchValue({
        destination: place2.name,
      });
      this.map.panTo(place2Geo);
      this.markers[1] = marker;
      this.markers.forEach((marker) => {
        bounds.extend(marker.position!);
      });
      this.destinationLatLng = place2Geo;
      this.map.fitBounds(bounds);
    });
  }
  // calculate Distance, time and priceing Of Vehicle Types
  onClickCalculatePricing() {
    this.vehiclePricings = [];
    const directionServices = new google.maps.DirectionsService();
    const request = {
      origin: this.sourceLatLng,
      destination: this.destinationLatLng,
      travelMode: google.maps.TravelMode.DRIVING,
      optimizeWaypoints: true,
    };

    directionServices.route(request, (result: any, status) => {
      this.directionsRenderer.setMap(null);
      this.directionsRenderer.setMap(this.map);
      this.directionsRenderer.setDirections(result);
      let estimatedDistance: number;
      const route = result!.routes[0];

      estimatedDistance = Number(
        (route.legs[0].distance.value / 1000).toFixed(2)
      );
      this.estimatedDistance = `${estimatedDistance} Km.`;
      let totalminutes = Number(route.legs[0].duration.value / 60);
      let minutes = Math.ceil(totalminutes % 60);
      let hours = Math.floor(totalminutes / 60);
      let day = Math.floor(hours / 24);
      let time = `empty`;
      if (hours == 0) {
        time = `${minutes} Minutes`;
      } else if (hours > 0 && hours < 24) {
        time = `${hours} Hours , ${minutes} Minutes`;
      } else {
        time = `${day} Days , ${hours % 24} Hours , ${minutes} Minutes`;
      }
      this.estimatedTime = time;
      this.createRideService.getVehiclePricings(this.sourceZoneId).subscribe({
        next: (data) => {
          data.pricings.forEach((element) => {
            this.vehiclePricings.push({
              _id: element._id,
              totalPrice:
                element.basePrice +
                (estimatedDistance - element.distanceForBasePrice) *
                  element.pricePerUnitDistance +
                totalminutes * element.pricePerUnitTime,
              vehicleType: element.vehicleType,
              totalDistance: estimatedDistance,
              totalTime: time,
            });
          });
        },
      });
    });
    this.isCalulated = true;
  }
  // set current date & time
  onClickNow() {
    let currentDateAndTime = new Date();
    this.rideForm.patchValue({
      rideTime: currentDateAndTime,
    });
  }
  // Opens Date & Time Modal
  onSelectSchedule() {
    console.log('on select called');
    let temp_schedule = document.getElementById(
      'schedule'
    ) as HTMLOptionElement;
    temp_schedule.selected = true;

    let modal = bootstrap.Modal.getOrCreateInstance(
      document.getElementById('dateAndTimeModal') as HTMLElement
    );
    modal.show();
  }
  // checks if Date & time are Valid Or not
  onSubmitDateAndTime() {
    let modal = bootstrap.Modal.getOrCreateInstance(
      document.getElementById('dateAndTimeModal') as HTMLElement
    );
    let temp_dateInp = document.getElementById(
      'dateInputInModal'
    ) as HTMLInputElement;
    let now = new Date();
    let selectedDateTime = temp_dateInp.value;
    let selectedDate = selectedDateTime.slice(0, 10);
    let selectedTime = selectedDateTime.slice(11, 19);
    let year = Number(selectedDate.slice(0, 4));
    let month = Number(selectedDate.slice(5, 7));
    let day = Number(selectedDate.slice(8, 10));
    let hours = Number(selectedTime.slice(0, 2));
    let minutes = Number(selectedTime.slice(3, 5));
    let scaduledDate = new Date(year, month - 1, day, hours, minutes);

    if (scaduledDate > now) {
      this.rideForm.patchValue({
        rideTime: scaduledDate,
      });
      modal.toggle();
    } else {
      this.toastr.warning(
        'Date or Time from past are not allowed',
        'Invalid Date and Time',
        environment.TROASTR_STYLE
      );
    }
  }
}
