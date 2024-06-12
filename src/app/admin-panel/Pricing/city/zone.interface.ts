export interface Zone {
    _id?: string,
    boundry: google.maps.LatLngLiteral[],
    zoneName: string,
    country:string
}

export interface ZoneCountries{
    countryName: string;
    countryShortName: string;
    _id?: string;
    countryLatLng: google.maps.LatLngLiteral;
}