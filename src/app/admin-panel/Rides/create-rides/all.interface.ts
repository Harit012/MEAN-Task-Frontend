export interface VehiclePricingInterface {
  _id: string;
  vehicleType: number;
  driverProfit: number;
  minFare: number;
  distanceForBasePrice: number;
  basePrice: number;
  pricePerUnitDistance: number;
  pricePerUnitTime: number;
  maxSpace: number;
}

export interface BoxPricingContent {
  _id: string;
  totalPrice: number;
  vehicleType: number;
  totalDistance: number;
  totalTime: string;
}
