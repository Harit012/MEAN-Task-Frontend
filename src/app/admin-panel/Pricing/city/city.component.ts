import { Component, OnInit, inject } from '@angular/core';
import { CountriesService } from '../country/countries.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { Country } from '../country/country.interface';
import { Zone, ZoneCountries } from './zone.interface';
import { CityService } from './city.service';
import { RecivingZone } from './recivingZone.interface';
import { AuthService } from '../../../auth/auth.service';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-city',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './city.component.html',
  styleUrl: './city.component.css',
})
export class CityComponent implements OnInit {
  countries: ZoneCountries[] = [];
  map!: google.maps.Map;
  center: google.maps.LatLngLiteral = { lat: 22, lng: 72 };
  polyCoordinates: google.maps.LatLngLiteral[] = [];
  updatedPolyCoordinates: google.maps.LatLngLiteral[] = [];
  selectedCountry!: ZoneCountries;
  filteredZones: RecivingZone[] = [];
  editId: string = '';
  editMode: boolean = false;
  updatedInputIndex!: number;
  drawingManager!: google.maps.drawing.DrawingManager;
  polygon!: google.maps.Polygon;
  editedpolygon!: google.maps.Polygon;

  zoneName: string = '';
  countryName: string = '';
  countryShortName: string = '';
  googleMapStyles: google.maps.MapTypeStyle[] = [
    {
      elementType: 'geometry',
      stylers: [
        {
          color: '#1d2c4d',
        },
      ],
    },
    {
      elementType: 'labels.text.fill',
      stylers: [
        {
          color: '#8ec3b9',
        },
      ],
    },
    {
      elementType: 'labels.text.stroke',
      stylers: [
        {
          color: '#1a3646',
        },
      ],
    },
    {
      featureType: 'administrative',
      elementType: 'geometry',
      stylers: [
        {
          visibility: 'off',
        },
      ],
    },
    {
      featureType: 'administrative.country',
      elementType: 'geometry.stroke',
      stylers: [
        {
          color: '#4b6878',
        },
      ],
    },
    {
      featureType: 'administrative.land_parcel',
      stylers: [
        {
          visibility: 'off',
        },
      ],
    },
    {
      featureType: 'administrative.land_parcel',
      elementType: 'labels.text.fill',
      stylers: [
        {
          color: '#64779e',
        },
      ],
    },
    {
      featureType: 'administrative.neighborhood',
      stylers: [
        {
          visibility: 'off',
        },
      ],
    },
    {
      featureType: 'administrative.province',
      elementType: 'geometry.stroke',
      stylers: [
        {
          color: '#4b6878',
        },
      ],
    },
    {
      featureType: 'landscape.man_made',
      elementType: 'geometry.stroke',
      stylers: [
        {
          color: '#334e87',
        },
      ],
    },
    {
      featureType: 'landscape.natural',
      elementType: 'geometry',
      stylers: [
        {
          color: '#023e58',
        },
      ],
    },
    {
      featureType: 'poi',
      stylers: [
        {
          visibility: 'off',
        },
      ],
    },
    {
      featureType: 'poi',
      elementType: 'geometry',
      stylers: [
        {
          color: '#283d6a',
        },
      ],
    },
    {
      featureType: 'poi',
      elementType: 'labels.text',
      stylers: [
        {
          visibility: 'off',
        },
      ],
    },
    {
      featureType: 'poi',
      elementType: 'labels.text.fill',
      stylers: [
        {
          color: '#6f9ba5',
        },
      ],
    },
    {
      featureType: 'poi',
      elementType: 'labels.text.stroke',
      stylers: [
        {
          color: '#1d2c4d',
        },
      ],
    },
    {
      featureType: 'poi.park',
      elementType: 'geometry.fill',
      stylers: [
        {
          color: '#023e58',
        },
      ],
    },
    {
      featureType: 'poi.park',
      elementType: 'labels.text.fill',
      stylers: [
        {
          color: '#3C7680',
        },
      ],
    },
    {
      featureType: 'road',
      elementType: 'geometry',
      stylers: [
        {
          color: '#304a7d',
        },
      ],
    },
    {
      featureType: 'road',
      elementType: 'labels',
      stylers: [
        {
          visibility: 'off',
        },
      ],
    },
    {
      featureType: 'road',
      elementType: 'labels.icon',
      stylers: [
        {
          visibility: 'off',
        },
      ],
    },
    {
      featureType: 'road',
      elementType: 'labels.text.fill',
      stylers: [
        {
          color: '#98a5be',
        },
      ],
    },
    {
      featureType: 'road',
      elementType: 'labels.text.stroke',
      stylers: [
        {
          color: '#1d2c4d',
        },
      ],
    },
    {
      featureType: 'road.highway',
      elementType: 'geometry',
      stylers: [
        {
          color: '#2c6675',
        },
      ],
    },
    {
      featureType: 'road.highway',
      elementType: 'geometry.stroke',
      stylers: [
        {
          color: '#255763',
        },
      ],
    },
    {
      featureType: 'road.highway',
      elementType: 'labels.text.fill',
      stylers: [
        {
          color: '#b0d5ce',
        },
      ],
    },
    {
      featureType: 'road.highway',
      elementType: 'labels.text.stroke',
      stylers: [
        {
          color: '#023e58',
        },
      ],
    },
    {
      featureType: 'transit',
      stylers: [
        {
          visibility: 'off',
        },
      ],
    },
    {
      featureType: 'transit',
      elementType: 'labels.text.fill',
      stylers: [
        {
          color: '#98a5be',
        },
      ],
    },
    {
      featureType: 'transit',
      elementType: 'labels.text.stroke',
      stylers: [
        {
          color: '#1d2c4d',
        },
      ],
    },
    {
      featureType: 'transit.line',
      elementType: 'geometry.fill',
      stylers: [
        {
          color: '#283d6a',
        },
      ],
    },
    {
      featureType: 'transit.station',
      elementType: 'geometry',
      stylers: [
        {
          color: '#3a4762',
        },
      ],
    },
    {
      featureType: 'water',
      elementType: 'geometry',
      stylers: [
        {
          color: '#0e1626',
        },
      ],
    },
    {
      featureType: 'water',
      elementType: 'geometry.fill',
      stylers: [
        {
          color: '#ededed',
        },
      ],
    },
    {
      featureType: 'water',
      elementType: 'labels.text',
      stylers: [
        {
          visibility: 'off',
        },
      ],
    },
    {
      featureType: 'water',
      elementType: 'labels.text.fill',
      stylers: [
        {
          color: '#4e6d70',
        },
      ],
    },
  ];

  toastr = inject(ToastrService);
  constructor(
    private countryService: CountriesService,
    private cityService: CityService,
    private authService: AuthService
  ) {}
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
      this.toastr.error(`Unknown Error`, `Error :- ${err.status}`, environment.TROASTR_STYLE);
    }
  }
  ngOnInit(): void {
    this.countryService.getCountries().subscribe({
      next:(data) => {
        if (data.countries) {
          let data1: Country[] = data.countries;
          data1.forEach((element: Country) => {
            this.countries.push({
              _id: element._id,
              countryName: element.countryName,
              countryShortName: element.countryShortName,
              countryLatLng: element.latlng!,
            });
          });
        } 
      },
      error: (err) => {
        this.commonErrorHandler(err);
      }
    });
    this.initMap();
  }

  onCountryChanged(event: any) {
    let tempCountry = event.target.value;
    for(let cntry of this.countries){
      if(cntry.countryShortName == tempCountry){
        this.selectedCountry = cntry;
      }
    }
    this.map.setCenter(this.selectedCountry.countryLatLng);
    this.map.setZoom(6);
    this.editMode = false;
    let cityForm = document.getElementById('cityForm') as HTMLFormElement;
    cityForm.reset();
    this.googleAutoComplete(event.target.value);
    this.getZone();
  }

  // Functions for Map & Autocomplete
  googleAutoComplete(country: string) {
    const searchInput = document.getElementById('searchcity');
    const autocomplete = new google.maps.places.Autocomplete(
      searchInput as HTMLInputElement,
      {
        componentRestrictions: { country: country },
        types: ['(cities)'],
      }
    );

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      let country: any = place['address_components'];
      this.drawingManager.setOptions({
        drawingMode: google.maps.drawing.OverlayType.POLYGON,
        drawingControl: true,
      });
      country.forEach((element: any) => {
        if (element.types.includes('country')) {
          country = element.long_name;
          this.countryShortName = element.short_name;
          this.countryName = country;
        } else if (element.types.includes('administrative_area_level_1')) {
          this.zoneName = element.long_name;
        }
      });
      this.zoneName = place.name + ',' + this.zoneName;
      this.map.setCenter(place.geometry?.location?.toJSON()!);
      this.map.setZoom(10);
    });
  }
  initMap(): void {
    this.map = new google.maps.Map(
      document.getElementById('map') as HTMLElement,
      {
        center: { lat: 22.3039, lng: 70.8022 },
        zoom: 10,
        styles: this.googleMapStyles,
      }
    );
    this.drawingManager = new google.maps.drawing.DrawingManager({
      drawingMode: google.maps.drawing.OverlayType.POLYGON,
      drawingControl: true,
      drawingControlOptions: {
        position: google.maps.ControlPosition.TOP_CENTER,
        drawingModes: [google.maps.drawing.OverlayType.POLYGON],
      },
      polygonOptions: {
        zIndex: 1,
        strokeWeight: 2,
        strokeColor: 'rgb(255, 255, 0)',
        fillColor: 'rgb(255, 255, 0)',
      },
    });
    this.drawingManager.setMap(this.map);
    this.drawingManager.setOptions({
      drawingMode: null,
      drawingControl: false,
    });
    google.maps.event.addListener(
      this.drawingManager,
      'overlaycomplete',
      (event: any) => {
        if (this.polygon) {
          this.polygon.setMap(null);
        }
        if (event.type === google.maps.drawing.OverlayType.POLYGON) {
          this.polygon = event.overlay as google.maps.Polygon;
          this.polyCoordinates = this.polygon
            .getPath()
            .getArray()
            .map((coord) => ({
              lat: coord.lat(),
              lng: coord.lng(),
            }));
        }
      }
    );
  }
  logPolygonCoordinates(polygon: google.maps.Polygon): void {
    const path = polygon.getPath();
    const coordinates: google.maps.LatLngLiteral[] = [];
    for (let i = 0; i < path.getLength(); i++) {
      const latLng = path.getAt(i).toJSON();
      coordinates.push(latLng);
    }
    this.updatedPolyCoordinates = coordinates;
  }

  // for editMode

  onEditZone(i: number) {
    this.drawingManager.setOptions({
      drawingMode: null,
      drawingControl: false,
    });
    const citybox = document.getElementById('searchcity') as HTMLInputElement;
    citybox.value = this.filteredZones[i].zoneName;
    const zone = this.filteredZones[i];
    this.updatedInputIndex = i;
    this.editMode = true;
    this.map.panTo(zone.boundry[0]);
    this.map.setZoom(9);
    this.editId = zone._id!;
    this.editedpolygon = new google.maps.Polygon({
      paths: zone.boundry,
      strokeColor: '#FF0000',
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: '#FF0000',
      fillOpacity: 0.35,
      editable: true,
    });
    this.editedpolygon.setMap(this.map);
    const path = this.editedpolygon.getPath();
    path.addListener('set_at', () =>
      this.logPolygonCoordinates(this.editedpolygon)
    );
    path.addListener('insert_at', () =>
      this.logPolygonCoordinates(this.editedpolygon)
    );
  }

  // to reset the page to normal
  resetMap() {
    if (confirm('Are you sure want to reset map?')) {
      let citybox = document.getElementById('searchcity') as HTMLInputElement;
      this.zoneName="";
      citybox.value = '';
      this.polygon.setMap(null);
      this.map.panTo(this.center);
      // this.initMap()
    } else {
      return;
    }
  }
  leaveEditMode() {
    if (confirm('Are you sure want to leave Edit Mode ?')) {
      let citybox = document.getElementById('searchcity') as HTMLInputElement;
      citybox.value = '';
      this.editMode = false;
      this.editedpolygon.setMap(null);
      this.map.panTo(this.center);
    } else {
      return;
    }
  }

  // CRUD OPERATIONS
  editZone() {
    if (this.updatedPolyCoordinates.length > 2 && this.editId != '') {
      this.cityService
        .updateZone({ boundry: this.updatedPolyCoordinates, id: this.editId })
        .subscribe({
          next: (data) => {
            if (data.zone) {
              this.filteredZones[this.updatedInputIndex] = data.zone;
              this.toastr.success(
                `Zone ${data.zone.zoneName} updated`,
                'Success',
                environment.TROASTR_STYLE
              );
            }
          },
          error: (err) => {
            this.commonErrorHandler(err);
          },
        });
      this.updatedPolyCoordinates = [];
      this.editMode = false;
      this.editedpolygon.setMap(null);
      this.map.panTo(this.center);
    } else {
      this.toastr.warning(
        `Values are Not Valid`,
        'Warning',
        environment.TROASTR_STYLE
      );
    }
  }
  addNewZone() {
    let citybox = document.getElementById('searchcity') as HTMLInputElement;
    let border = this.polyCoordinates;
    if (border.length > 2 || this.zoneName == '') {
      const zone: Zone = {
        zoneName: this.zoneName,
        boundry: border,
        country: this.selectedCountry._id!,
        // countryName: this.countryName,
        // countryShortName: this.countryShortName,
      };
      this.cityService.addZone(zone).subscribe({
        next: (data) => {
          if (data.zones) {
            this.filteredZones = data.zones;
            this.toastr.success(
              `Zone ${zone.zoneName} added`,
              'Success',
              environment.TROASTR_STYLE
            );
            this.zoneName = '';
            this.polygon.setMap(null);
            this.map.panTo({ lat: 22.3039, lng: 70.8022 });
            this.drawingManager.setOptions({
              drawingMode: null,
              drawingControl: false,
            });
            this.map.setCenter(this.selectedCountry.countryLatLng);
            this.map.setZoom(6);
            citybox.value = '';
          }
        },
        error: (err) => {
          this.commonErrorHandler(err);
        },
      });
    } else {
      this.toastr.warning(
        `Zone has no boundries`,
        'Warning',
        environment.TROASTR_STYLE
      );
    }
  }
  getZone() {
    this.cityService.getZones(this.selectedCountry._id!).subscribe({
      next: (data) => {
        if (data.zones) {
          this.filteredZones = data.zones;
        } 
      },
      error: (err) => {
        this.commonErrorHandler(err);
      },
    });
  }
}
