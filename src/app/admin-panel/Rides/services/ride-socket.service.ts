import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { io } from 'socket.io-client';
import { ConfirmedRide } from '../confirmed-rides/confirmed-ride.interface';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class RideSocketService {
  private socket = io('ws://localhost:3000');

  constructor(private toastr:ToastrService) {}

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
      this.socket.on('cancelRide', (cancelRide: ConfirmedRide) => {
        observer.next(cancelRide);
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
  getAcceptedRide() {
    return new Observable((observer) => {
      this.socket.on('acceptRideFromServer', (ride: ConfirmedRide) => {
        observer.next(ride);
      });
      return () => {
        this.socket.disconnect();
      };
    });
  }
  // when status change
  getStatusChange() {
    return new Observable((observer) => {
      this.socket.on('changeStatusFromServer', (ride: ConfirmedRide) => {
        observer.next(ride);
      });
      return () => {
        this.socket.disconnect();
      };
    });
  }

  getRemainingTime(){
    return new Observable((observer) => {
      this.socket.on('remainingTime', (data:{seconds:number,rideId:string}) => {
        observer.next(data);
      });
      return () => {
        this.socket.disconnect();
      };
    });
  }

  rejectRide(){
    return new Observable((observer) => {
      this.socket.on('Rejected', (data:{rideId:string}) => {
        observer.next(data);
      });
      return () => {
        this.socket.disconnect();
      };
    });
  }

  // for driver action 

  // driverResponse(response:number){
  //   this.socket.emit('DriverReaction',{reaction:response});
  // }

  // after driver action is done
  // onRequestAccepted(){
  //   return new Observable((observer) => {
  //     this.socket.on('Accepted', (data: AssignStatusFromSocket ) => {
  //       observer.next(data);
  //     });
  //     return () => {
  //       this.socket.disconnect();
  //     };
  //   })
  // }
  // onRequestRejected(){
  //   return new Observable((observer) => {
  //     this.socket.on('Rejected', (data: AssignStatusFromSocket ) => {
  //       observer.next(data);
  //     });
  //     return () => {
  //       this.socket.disconnect();
  //     };
  //   })
  // } 
  // onRidePending(){
  //   return new Observable((observer) => {
  //     this.socket.on('Pending', (data: AssignStatusFromSocket ) => {
  //       observer.next(data);
  //     });
  //     return () => {
  //       this.socket.disconnect();
  //     };
  //   })
  // } 

  // onError(){
  //   this.socket.on("Error",(data)=>{
  //     this.toastr.error(data.message, "Erro in Socket", environment.TROASTR_STYLE)
  //   })
  // }

  onCronStop(){
    return new Observable((observer) => {
      this.socket.on('cronEnd', (data: {message:string, rideId:string} ) => {
        observer.next(data);
      });
      return () => {
        this.socket.disconnect();
      };
    })
  }

  onCompeteRide(){
    return new Observable((observer) => {
      this.socket.on('CompletedRide', (data: ConfirmedRide ) => {
        observer.next(data);
      });
      return () => {
        this.socket.disconnect();
      };
    })
  }
}
