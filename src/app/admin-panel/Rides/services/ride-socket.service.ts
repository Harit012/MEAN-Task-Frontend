import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { io } from 'socket.io-client';
import { ConfirmedRide } from '../confirmed-rides/confirmed-ride.interface';

@Injectable({
  providedIn: 'root',
})
export class RideSocketService {
  private socket = io('ws://localhost:3000');

  constructor() {}

  getMessages() {
    return new Observable((observer) => {
      this.socket.on('message', (message) => {
        observer.next(message);
      });
      return () => {
        this.socket.disconnect();
      };
    });
  }

  getNewRide() {
    return new Observable((observer) => {
      this.socket.on('newRide', (ride: ConfirmedRide) => {
        observer.next(ride);
      });
      return () => {
        this.socket.disconnect();
      };
    });
  }

  cancleRide() {
    return new Observable((observer) => {
      this.socket.on('cancelRide', (rideId: string) => {
        observer.next(rideId);
      });
      return () => {
        this.socket.disconnect();
      };
    });
  }
// when admin assigns ride to driver
  getAssignedRide() {
    return new Observable((observer) => {
      this.socket.on('assignRideFromServer', (ride: ConfirmedRide) => {
        observer.next(ride);
      });
      return () => {
        this.socket.disconnect();
      };
    });
  }

// When any driver accepts the request 
  getAcceptedRide(){
    return new Observable((observer)=>{
      this.socket.on('acceptRideFromServer', (ride:ConfirmedRide)=>{
        observer.next(ride);
      });
      return () => {
        this.socket.disconnect();
      };
    })
  }
  // when status change
  getStatusChange(){
    return new Observable((observer)=>{
      this.socket.on('changeStatusFromServer', (ride:ConfirmedRide)=>{
        observer.next(ride);
      });
      return () => {
        this.socket.disconnect();
      };
    })
  }
}
