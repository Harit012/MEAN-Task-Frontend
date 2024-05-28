import { Card } from "./card.interface";

export interface UserGet {
    _id: string;
    userName: string;
    email: string;
    phone: number;
    userProfile: string;
    countryCode: string;
    countryName:string;
    cards:Card[]  
}