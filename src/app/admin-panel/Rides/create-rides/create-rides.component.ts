import { AfterViewInit, Component, OnInit, inject } from '@angular/core';
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
  stopsArray: string[] = [];
  stopDetails: any;

  // for form
  calculated_source!: string;
  calculated_destination!: string;
  calculated_stops: string[] = [];
  calculated_serviceType!: string;
  calculated_paymentMethod!: string;
  calculated_rideTime!: string;
  calculated_ride!: any;
  calculated_distance!: string;
  calculated_time!: string;
  calculated_stopPoints: google.maps.LatLngLiteral[] = [];
  calculated_startEndLatLng: google.maps.LatLngLiteral[] = [];

  // For Map
  map!: google.maps.Map;
  sourceLatLng!: google.maps.LatLngLiteral | undefined;
  destinationLatLng!: google.maps.LatLngLiteral | undefined; 
  center!: google.maps.LatLngLiteral;
  markers: google.maps.marker.AdvancedMarkerElement[] = [];
  stopMarkers: google.maps.marker.AdvancedMarkerElement[] = [];
  stopLatLngs: google.maps.LatLngLiteral[] = [];
  autocompleteOptions!: google.maps.places.AutocompleteOptions;
  autoComplete1!: google.maps.places.Autocomplete;
  autoComplete2!: google.maps.places.Autocomplete;
  autoComplete3!: google.maps.places.Autocomplete;
  mapStyle:google.maps.MapTypeStyle[] = [
    {
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#212121"
        }
      ]
    },
    {
      "elementType": "labels.icon",
      "stylers": [
        {
          "visibility": "off"
        }
      ]
    },
    {
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#757575"
        }
      ]
    },
    {
      "elementType": "labels.text.stroke",
      "stylers": [
        {
          "color": "#212121"
        }
      ]
    },
    {
      "featureType": "administrative",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#757575"
        }
      ]
    },
    {
      "featureType": "administrative.country",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#9e9e9e"
        }
      ]
    },
    {
      "featureType": "administrative.land_parcel",
      "stylers": [
        {
          "visibility": "off"
        }
      ]
    },
    {
      "featureType": "administrative.locality",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#bdbdbd"
        }
      ]
    },
    {
      "featureType": "poi",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#757575"
        }
      ]
    },
    {
      "featureType": "poi.park",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#181818"
        }
      ]
    },
    {
      "featureType": "poi.park",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#616161"
        }
      ]
    },
    {
      "featureType": "poi.park",
      "elementType": "labels.text.stroke",
      "stylers": [
        {
          "color": "#1b1b1b"
        }
      ]
    },
    {
      "featureType": "road",
      "elementType": "geometry.fill",
      "stylers": [
        {
          "color": "#2c2c2c"
        }
      ]
    },
    {
      "featureType": "road",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#8a8a8a"
        }
      ]
    },
    {
      "featureType": "road.arterial",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#373737"
        }
      ]
    },
    {
      "featureType": "road.highway",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#3c3c3c"
        }
      ]
    },
    {
      "featureType": "road.highway.controlled_access",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#4e4e4e"
        }
      ]
    },
    {
      "featureType": "road.local",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#616161"
        }
      ]
    },
    {
      "featureType": "transit",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#757575"
        }
      ]
    },
    {
      "featureType": "water",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#000000"
        }
      ]
    },
    {
      "featureType": "water",
      "elementType": "geometry.fill",
      "stylers": [
        {
          "color": "#c6d2d2"
        }
      ]
    },
    {
      "featureType": "water",
      "elementType": "geometry.stroke",
      "stylers": [
        {
          "color": "#e1eaea"
        }
      ]
    },
    {
      "featureType": "water",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#3d3d3d"
        }
      ]
    }
  ]
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
    private cityService: CityService
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
      stops: new FormControl([]),
      serviceType: new FormControl(null, [Validators.required]),
      paymentMethod: new FormControl(null, [Validators.required]),
      rideTime: new FormControl(null, [Validators.required]),
      rideType: new FormControl(null, [Validators.required]),
    });
  }
  get stops(): FormArray {
    return this.rideForm.get('stops') as FormArray;
  }

  // TO create Image Of marker
  createMarkersFromImage(image:string) {
    let element = document.createElement('img');
    element.src = image;
    element.height= 50;
    element.width = 50;
    return element
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
        styles: this.mapStyle,      
        mapId: '8f2d9c7f9f9f8a9f',
      }
    );
  }
  // to Verify user from phone number
  onVerifyPhoneNumber() {
    if (this.rideForm.get('phone')?.valid ) {
      if(this.isVerified && this.verifiedUser.phone == this.rideForm.get('phone')?.value) {
        this.toastr.info('Phone number already verified', '', environment.TROASTR_STYLE)
        return;
      }
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
    const customPinElement = document.createElement('div');
      customPinElement.style.backgroundImage = 'url("https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.pngegg.com%2Fen%2Fsearch%3Fq%3Dmap%2Bpin&psig=AOvVaw3JT44dx-r4JDeRfspEjQc2&ust=1721469325472000&source=images&cd=vfe&opi=89978449&ved=0CBEQjRxqFwoTCNCw0pDrsocDFQAAAAAdAAAAABAE")';
      customPinElement.style.backgroundSize = 'contain';
      customPinElement.style.width = '50px';
      customPinElement.style.height = '50px';
    if (this.stopsArray.length < this.settings.stops) {
      if (this.stopDetails != undefined) {
        // let marker!:google.maps.marker.AdvancedMarkerElement;
        let marker = new google.maps.marker.AdvancedMarkerElement({
          position: this.stopDetails.placeLatLng,
          title: this.stopDetails.place.name,
          content: this.createMarkersFromImage("../../assets/Images/pin.png"),
          map: this.map,
        });
        
        this.stopMarkers[this.stopsArray.length] = marker;
        this.stopLatLngs[this.stopsArray.length] = this.stopDetails.placeLatLng;
          this.stopsArray[this.stopsArray.length] = this.stopDetails.place.name;
          this.stopDetails = undefined;
        let temp_stops = document.getElementById(
          'stopAutocomplete'
        ) as HTMLInputElement;
        temp_stops.value = '';
      } else {
        this.toastr.warning(
          'Please select a stop',
          'warning',
          environment.TROASTR_STYLE
        );
      }
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
    this.stopMarkers = this.stopMarkers
      .slice(0, i)
      .concat(this.stopMarkers.slice(i + 1, this.stopMarkers.length));
    this.stopsArray = this.stopsArray
      .slice(0, i)
      .concat(this.stopsArray.slice(i + 1, this.stopsArray.length));
    this.stopLatLngs = this.stopLatLngs
      .slice(0, i)
      .concat(this.stopLatLngs.slice(i + 1, this.stopLatLngs.length));
  }
  // to get current location
  getCurrentLocation() {
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
        content: this.createMarkersFromImage("../../assets/Images/SourcePin.png"),
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
    let price: number = 0;
    if (this.rideForm.valid) {
      for (let pricing of this.vehiclePricings) {
        if (pricing.vehicleType == this.rideForm.value.serviceType) {
          price = Number(pricing.price.toFixed(2));
        } else {
          continue;
        }
      }
      console.log(this.calculated_startEndLatLng)
      console.log(this.calculated_stopPoints)
      let RideObject = {
        userId: this.verifiedUser._id,
        username: this.rideForm.value.userName,
        useremail: this.rideForm.value.userEmail,
        userphone: this.rideForm.value.phone,
        source: this.calculated_source,
        destination: this.calculated_destination,
        stops: this.calculated_stops,
        serviceType: this.rideForm.value.serviceType,
        paymentmethod: this.rideForm.value.paymentMethod,
        ridetime: this.rideForm.value.rideTime,
        distance: this.calculated_distance,
        time: this.calculated_time,
        price: price,
        rideType: this.rideForm.value.rideType,
        endPoints: this.calculated_startEndLatLng,
        stopPoints: this.calculated_stopPoints,
        sourceCity: this.sourceZoneId
      };
      this.createRideService.postRide(RideObject).subscribe({
        next: (data) => {
          this.toastr.success(
            `Ride Has Been Created`,
            'Success',
            environment.TROASTR_STYLE
          );
          this.initMap();
          this.rideForm.reset();
          this.isCalulated = false;
          this.isVerified = false;
          this.stopLatLngs = [];
          this.stopDetails = [];
          this.stopMarkers = [];
          this.stopsArray = [];
        },
      });
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
      types: ['establishment'],

      fields: ['address_components', 'geometry', 'name', 'place_id'],
    };   
    this.autoComplete1 = new google.maps.places.Autocomplete(
      document.getElementById('source') as HTMLInputElement,
      this.autocompleteOptions
    );
    this.autoComplete2 = new google.maps.places.Autocomplete(
      document.getElementById('destination') as HTMLInputElement,
      this.autocompleteOptions
    );
    this.autoComplete3 = new google.maps.places.Autocomplete(
      document.getElementById('stopAutocomplete') as HTMLInputElement,
      this.autocompleteOptions
    );

    // this.autoComplete3 = new google.maps.places.AutocompleteService()
    // this.autoComplete3.getPlacePredictions({
    //   input: 'tajmahal',
    //   sessionToken: sessionsToken
    // },(data, status) => {
    //   console.log(data)
    // })

    // onSourceChange
    this.onSourceChange();

    // onDestinationChange
    this.onDestinationChange();

    // onStopChange
    this.onStopchange();
  }

  // triggered when Source is Changed
  onSourceChange() {
    this.autoComplete1.addListener('place_changed', () => {
      let zoneName = 'none';
      let marker: google.maps.marker.AdvancedMarkerElement;
      const place = this.autoComplete1.getPlace();
      let bounds = new google.maps.LatLngBounds();
      let temp_source = document.getElementById('source') as HTMLInputElement;

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
          content: this.createMarkersFromImage("../../assets/Images/SourcePin.png"),
        });
        this.rideForm.patchValue({
          source: place.name,
        });
        // temp_source.value = place.name!;
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

        temp_source.value = '';
      }
      if(this.destinationLatLng?.lat === this.sourceLatLng?.lat && this.destinationLatLng?.lng === this.sourceLatLng?.lng){
        this.toastr.warning(
          `Source and Destination cannot be same`,
          'Info',
          environment.TROASTR_STYLE
        );

        temp_source.value = '';
        this.sourceLatLng = undefined;
      }
    });
  }
  // triggers when Destination is changed
  onDestinationChange() {
    let temp_destination = document.getElementById('destination') as HTMLInputElement;
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
        content: this.createMarkersFromImage("../../assets/Images/DestinationPin2.png"),
      });
      this.rideForm.patchValue({
        destination: place2.name,
      });
      this.destinationLatLng = place2Geo;
      if(this.destinationLatLng.lat === this.sourceLatLng?.lat && this.destinationLatLng.lng === this.sourceLatLng?.lng){
        this.toastr.warning(
          `Source and Destination cannot be same`,
          'Info',
          environment.TROASTR_STYLE
        );

        temp_destination.value = '';
      }
      this.map.panTo(place2Geo);
      this.markers[1] = marker;
      this.markers.forEach((marker) => {
        bounds.extend(marker.position!);
      });
      this.map.fitBounds(bounds);
    });
  }

  onStopchange() {
    this.autoComplete3.addListener('place_changed', () => {
      const place3 = this.autoComplete3.getPlace();
      const place3Geo: google.maps.LatLngLiteral = {
        lat: place3.geometry?.location?.lat()!,
        lng: place3.geometry?.location?.lng()!,
      };
      this.stopDetails = {
        place: place3,
        placeLatLng: place3Geo,
      };
    });
  }
  // calculate Distance, time and priceing Of Vehicle Types
  onClickCalculatePricing() {
    if (
      this.rideForm.value.source == null ||
      this.rideForm.value.destination == null||
      this.sourceLatLng == undefined ||
      this.destinationLatLng == undefined
    ) {
      this.toastr.warning(
        'Source and Destination is not correct',
        'Error',
        environment.TROASTR_STYLE
      );
      return;
    }
    this.vehiclePricings = [];
    
    const directionServices = new google.maps.DirectionsService();
    const request = {
      origin: this.sourceLatLng,
      destination: this.destinationLatLng,
      travelMode: google.maps.TravelMode.DRIVING,
      waypoints: this.stopLatLngs.map((stop) => ({
        location: stop,
        stopover: true,
      })),
      optimizeWaypoints: true,
    };
    directionServices.route(request, (result: any, status) => {
      this.directionsRenderer.setMap(null);
      this.directionsRenderer.setMap(this.map);
      this.directionsRenderer.setDirections(result);
      let estimatedDistance = 0;
      let totalminutes = 0;
      const route = result!.routes[0];
      // to calculate total distance & time
      route.legs.forEach(
        (leg: { distance: { value: number }; duration: { value: number } }) => {
          estimatedDistance += leg.distance.value;
          totalminutes += leg.duration.value;
        }
      );
      estimatedDistance = Number((estimatedDistance / 1000).toFixed(2));

      this.calculated_distance = `${estimatedDistance} Km.`;

      totalminutes = totalminutes / 60;
      let minutes = Math.ceil(totalminutes % 60);
      let hours = Math.floor(totalminutes / 60);
      let day = Math.floor(hours / 24);
      let time;
      if (hours == 0) {
        time = `${minutes} Minutes`;
      } else if (hours > 0 && hours < 24) {
        time = `${hours} Hours , ${minutes} Minutes`;
      } else {
        time = `${day} Days , ${hours % 24} Hours , ${minutes} Minutes`;
      }
      this.calculated_time = time;
      this.createRideService
        .postCalculatPricing(this.sourceZoneId, totalminutes, estimatedDistance)
        .subscribe({
          next: (data) => {
            this.vehiclePricings = data.prices;
          },
        });
    });
    this.isCalulated = true;
    this.calculated_source = this.rideForm.get('source')?.value;
    this.calculated_destination = this.rideForm.get('destination')?.value;
    this.calculated_stopPoints = this.stopLatLngs;
    this.calculated_startEndLatLng.push(this.sourceLatLng);
    this.calculated_startEndLatLng.push(this.destinationLatLng);
    this.rideForm.patchValue({
      stops: this.stopsArray,
    });
    this.calculated_stops = this.rideForm.get('stops')?.value;
  }
  // set current date & time
  onClickNow() {
    let currentDateAndTime = new Date();
    this.rideForm.patchValue({
      rideTime: currentDateAndTime,
      rideType: 'Now',
    });
  }
  // Opens Date & Time Modal
  onSelectSchedule() {
    this.rideForm.patchValue({
      rideTime: null,
    });
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
        rideType: 'Scheduled',
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
  // on reset form
  onReset() {
    if (confirm('Are you sure want to reset?')) {
      this.initMap();
      this.rideForm.reset();
      this.isCalulated = false;
      this.isVerified = false;
      this.stopLatLngs = [];
      this.stopDetails = [];
      this.stopMarkers = [];
      this.stopsArray = [];
    }
  }
}