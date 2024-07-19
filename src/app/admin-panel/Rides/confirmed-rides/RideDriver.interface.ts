import { StripeFpxBankComponent } from "ngx-stripe";

export interface RideDriver {
    _id: string;
    driverName: string;
    phone:string,
    serviceType:string,
    isAvailable:boolean,
    approved:boolean,
    country:string,
    driverProfile:string,
    driverEmail:string
}