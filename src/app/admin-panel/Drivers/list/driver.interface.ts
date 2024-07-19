export interface Driver {
    _id?: string ;
    driverName: string;
    driverEmail: string;
    phone: string;
    driverProfile: string;
    city: string;
    countryCode: string;
    countryName: string;
    approved?: boolean;
    serviceType:string;
    isAvailable?:boolean
}