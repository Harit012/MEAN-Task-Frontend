
export interface UserGet {
userEmail: any;
    _id: string;
    userName: string;
    email: string;
    phone: string;
    userProfile: string;
    countryCode: string;
    countryName:string;
    customerId: string;  
}

export interface VerifiedUser{
    _id: string,
  userProfile: string,
  userEmail: string,
  userName: string,
  phone: string,
  country: {
    _id: string,
    countryShortName:string,
    currency: string
  },
  customerId: string
}