import { Component, OnInit } from '@angular/core';
import { CountriesService } from '../country/countries.service';
import { map } from 'rxjs';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { Country } from '../country/country.interface';
import { Zone } from './zone.interface';
import { CityService } from './city.service';
import { RecivingZone } from './recivingZone.interface';
import { AuthService } from '../../../auth/auth.service';

@Component({
  selector: 'app-city',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './city.component.html',
  styleUrl: './city.component.css',
})
export class CityComponent implements OnInit {
  countries: {
    countryName: string;
    countryShortName: string;
    _id?: string;
    countryLatLng: google.maps.LatLngLiteral;
  }[] = [];
  map!: google.maps.Map;
  center: google.maps.LatLngLiteral = { lat: 22, lng: 72 };
  polyCoordinates: google.maps.LatLngLiteral[] = [];
  updatedPolyCoordinates: google.maps.LatLngLiteral[] = [];
  selectedCountry!: {
    countryName: string;
    countryShortName: string;
    _id?: string;
    countryLatLng: google.maps.LatLngLiteral;
  };
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

  constructor(
    private countryService: CountriesService,
    private cityService: CityService,
    private authService: AuthService
  ) {}
  ngOnInit(): void {
    this.countryService
      .getCountries()
      .subscribe((data) => {
        if(data.countries){
          let data1: Country[] = data.countries;
          data1.forEach((element: Country) => {
            this.countries.push({
              _id: element._id,
              countryName: element.countryName,
              countryShortName: element.countryShortName,
              countryLatLng: element.latlng!,
            });
          });
        }else if (data.varified == false) {
          alert('User is not verified');
          this.authService.userLogOut();
        } else if (data.error) {
          alert(data.error);
        }
      });
    this.initMap();
  }

  onCountryChanged(event: any) {
    let tempCountry = event.target.value;
    for (let i = 0; i < this.countries.length; i++) {
      if (this.countries[i].countryShortName == tempCountry) {
        this.selectedCountry = this.countries[i];
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
    // this.polygon.setMap(null);
    const citybox = document.getElementById('searchcity') as HTMLInputElement;
    citybox.value = this.filteredZones[i].zoneName;
    const zone = this.filteredZones[i];
    this.updatedInputIndex = i;
    this.editMode = true;
    this.map.panTo(zone.boundry[0]);
    this.map.setZoom(9)
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
      citybox.value = '';
      this.polygon.setMap(null);
      this.map.panTo(this.center);
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
        .subscribe((data) => {
          if (data.zone) {
            this.filteredZones[this.updatedInputIndex] = data.zone;
          }else if (data.varified == false) {
            alert('User is not verified');
            this.authService.userLogOut();
          } else if (data.error) {
            alert(data.error);
          }
        });
      this.updatedPolyCoordinates = [];
      this.editMode = false;
      this.editedpolygon.setMap(null);
      this.map.panTo(this.center);
    } else {
      alert('Invalid criteria');
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
      this.cityService.addZone(zone).subscribe(
        (data) => {
          if (data.zones) {
            this.filteredZones = data.zones;
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
          } else if (data.varified == false) {
            alert('User is not verified');
            this.authService.userLogOut();
          } else if (data.error) {
            alert(data.error);
          }
        },
        (err) => {
          alert(err);
        }
      );
    } else {
      alert('zone has no boundries');
    }
  }
  getZone() {
    this.cityService.getZones(this.selectedCountry._id!).subscribe((data) => {
      if (data.zones) {
        this.filteredZones = data.zones;
      }else if (data.varified == false) {
        alert('User is not verified');
        this.authService.userLogOut();
      } else if (data.error) {
        alert(data.error);
      }
    });
  }
}
