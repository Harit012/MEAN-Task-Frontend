import { environment } from "../../environments/environment";

export class CommonStatic {
  public static addGoogleApi() {
    let sc = document.createElement('script');
    sc.src = `https://maps.googleapis.com/maps/api/js?key=${environment.GOOGLE_MAPS_API_KEY}&libraries=marker,places,drawing,geometry&v=weekly&loading=async`;
    sc.type = 'text/javascript';
    document.body.appendChild(sc);
  }
}
