import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { UserLoginComponent } from './auth/user-login/user-login.component';
import { environment } from '../environments/environment';
import { LoaderComponent } from './loader/loader.component';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { RideSocketService } from './admin-panel/Rides/services/ride-socket.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, UserLoginComponent,LoaderComponent],
  templateUrl: './app.component.html',
})
export class AppComponent implements  OnInit {
constructor(private http: HttpClient,private toastr: ToastrService , private ridesocketService: RideSocketService) {
  
}
  ngOnInit(): void {
    let sc = document.createElement('script');
    sc.src = `https://maps.googleapis.com/maps/api/js?key=${environment.GOOGLE_MAPS_API_KEY}&libraries=marker,places,drawing,geometry&v=weekly&loading=async`;
    sc.type = 'text/javascript';
    document.body.appendChild(sc);
    this.http.get(`${environment.BASE_URL}/user/test`).subscribe({
      next: (data) => {
        console.log(`connected to backend`)
      },
      error: (err) => {
        this.toastr.error("Backend is not connected","Error",environment.TROASTR_STYLE)
        console.log(err)
      }
    })
    this.ridesocketService.getMessages().subscribe((message:any)=>{
      // console.log(message)
    })
  }

}
