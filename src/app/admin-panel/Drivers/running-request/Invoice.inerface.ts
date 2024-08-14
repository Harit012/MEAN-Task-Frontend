export interface Invoice {
  id: string;
  driver_stripe_id: string;
  customerId: string;
  destination: string;
  source: string;
  rideTime: string;
  userName: string;
  time: string;
  paymentMethod: string;
  serviceType: string;
  price: number;
  driverName: string;
  driverProfit: number;
  csn: string;
  distance: string;
  rating?:number
}
