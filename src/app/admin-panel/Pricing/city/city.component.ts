import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CountriesService } from '../country/countries.service';
import { map } from 'rxjs';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { Country } from '../country/country.interface';
import { Zone } from './zone.interface';
import { CityService } from './city.service';

@Component({
  selector: 'app-city',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './city.component.html',
  styleUrl: './city.component.css',
})
export class CityComponent implements OnInit {
  countries: { countryName: string; countryShortName: string }[] = [];
  map!: google.maps.Map;
  @ViewChild('city') city!: ElementRef;
  center: google.maps.LatLngLiteral = { lat: 22, lng: 72 };
  polyCoordinates: google.maps.LatLngLiteral[] = [];
  updatedPolyCoordinates: google.maps.LatLngLiteral[] = [];
  selectedCountry: string = '';
  filteredZones: Zone[] = [];
  editId: string = '';
  editMode: boolean = false;
  updatedInputIndex!: number;

  zoneName: string = '';
  countryName: string = '';
  countryShortName: string = '';

  constructor(
    private countryService: CountriesService,
    private cityService: CityService
  ) {}
  ngOnInit(): void {
    this.countryService
      .getCountries()
      .pipe(map((data) => data.countries))
      .subscribe((data: Country[]) => {
        data.forEach((element: Country) => {
          this.countries.push({
            countryName: element.countryName,
            countryShortName: element.countryShortName,
          });
        });
      });
    this.initMap();
  }

  onCountryChanged(event: any) {
    this.selectedCountry = event.target.value;
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
      country.forEach((element: any) => {
        if (element.types.includes('country')) {
          country = element.long_name;
          this.countryShortName = element.short_name;
          this.countryName = country;
        }
      });
      this.zoneName = place.name!;
      this.map.setCenter(place.geometry?.location?.toJSON()!);
    });
  }
  initMap(): void {
    this.map = new google.maps.Map(
      document.getElementById('map') as HTMLElement,
      {
        center: { lat: 22.3039, lng: 70.8022 },
        zoom: 11,
      }
    );

    const drawingManager = new google.maps.drawing.DrawingManager({
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
    drawingManager.setMap(this.map);
    google.maps.event.addListener(
      drawingManager,
      'overlaycomplete',
      (event: any) => {
        if (event.type === google.maps.drawing.OverlayType.POLYGON) {
          const polygon = event.overlay as google.maps.Polygon;
          this.polyCoordinates = polygon
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
    this.updatedInputIndex = i;
    this.editMode = true;
    this.initMap();
    const citybox = document.getElementById('searchcity') as HTMLInputElement;
    citybox.value = this.filteredZones[i].zoneName;
    const zone = this.filteredZones[i];
    this.editId = zone._id!;
    let center = zone.boundry[0];
    this.map.setCenter(center);
    this.map.setZoom(10);
    let polygon = new google.maps.Polygon({
      paths: zone.boundry,
      strokeColor: '#FF0000',
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: '#FF0000',
      fillOpacity: 0.35,
      editable: true,
    });
    polygon.setMap(this.map);
    const path = polygon.getPath();
    path.addListener('set_at', () => this.logPolygonCoordinates(polygon));
    path.addListener('insert_at', () => this.logPolygonCoordinates(polygon));
  }

  // to reset the page to normal
  resetMap() {
    if (confirm('Are you sure want to reset map?')) {
      let citybox = document.getElementById('searchcity') as HTMLInputElement;
      citybox.value = '';
      this.initMap();
    } else {
      return;
    }
  }
  leaveEditMode() {
    if (confirm('Are you sure want to leave Edit Mode ?')) {
      let citybox = document.getElementById('searchcity') as HTMLInputElement;
      citybox.value = '';
      this.editMode = false;
      this.initMap();
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
          } else {
            alert(data.error);
          }
        });
      this.updatedPolyCoordinates = [];
      this.editMode = false;
      this.initMap();
    } else {
      alert('Invalid criteria');
    }
  }
  addNewZone() {
    let border = this.polyCoordinates;
    if (border.length > 2 || this.zoneName == '') {
      const zone: Zone = {
        zoneName: this.zoneName,
        boundry: border,
        countryName: this.countryName,
        countryShortName: this.countryShortName,
      };
      this.cityService.addZone(zone).subscribe(
        (data) => {
          if (data.zones) {
            this.filteredZones = data.zones;
          } else {
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
    this.cityService.getZones(this.selectedCountry).subscribe((data) => {
      if (data.zones) {
        this.filteredZones = data.zones;
      } else {
        alert(data.error);
      }
    });
  }
}
