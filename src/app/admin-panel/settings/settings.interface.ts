export interface Settings {
  _id?: string;
  timeOut: number;
  stops: number;
  mailerUser: string;
  mailerPassword: string;
  twilioAuthToken: string;
  twilioAccountSid: string;
  twilioPhoneNumber: string;
  stripePublishableKey: string;
  stripeSecretKey: string;
}
