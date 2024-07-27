export interface ConfirmedRide {
  _id: string;
  source: string;
  destination: string;
  time: string;
  distance: number;
  serviceType: string;
  paymentMethod: string;
  rideTime: string;
  price: string;
  stops: string[];
  userEmail?: string;
  userName: string;
  userPhone: string;
  rideId: string;
  rideType: string;
  userProfile: string;
  status: string;
  endPoints: google.maps.LatLngLiteral[];
  stopPoints: google.maps.LatLngLiteral[];
  driverId?: string;
  driverName?: string;
  sourceCity: string;
}

export interface AssignStatusFromSocket {
  rideId: string;
  status: string;
  driver: string;
  driverId:string;
  time: number;
  type: string;
  new?: boolean;
  itr: number;
  totalTime: number;
  totalItr: number;
}
