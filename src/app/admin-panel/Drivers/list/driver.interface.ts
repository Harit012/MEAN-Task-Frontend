export interface Driver {
    formData(formData: any): unknown;
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
    isAvailable?:boolean;
    driver_stripe_id?:string;
}

