export interface Country {
    countryName: string,
    currency: string,
    countryCallCode: string,
    FlagUrl?: string,
    _id?: string,
    timezones?: string[],
    latlng?: google.maps.LatLngLiteral,
    countryShortName: string
}