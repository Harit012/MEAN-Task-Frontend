import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "../../../../environments/environment";
import { ConfirmedRide } from "../confirmed-rides/confirmed-ride.interface";

@Injectable({
    providedIn: "root",
})
export class RideHistoryService {
    constructor(private http: HttpClient) {}

    getAllRides(){
        return this.http.get<{success: boolean, rides: ConfirmedRide[]}>(
            `${environment.BASE_URL}/admin/rides/ride-history/getAllRides`
        );
    }
}