export interface RecivingZone {
    _id?: string;
    zoneName: string;
    boundry: google.maps.LatLngLiteral[];
    country: {
        _id?: string;
        countryName: string;
        countryShortName: string;
    };
}