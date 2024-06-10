import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { UserLoginComponent } from './auth/user-login/user-login.component';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet,UserLoginComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnDestroy , OnInit{

  ngOnInit(): void {
    let sc=document.createElement('script');
    sc.src=`https://maps.googleapis.com/maps/api/js?key=${environment.GOOGLE_MAPS_API_KEY}&libraries=places,drawing&v=weekly&loading=async`;
    sc.type="text/javascript";

    document.body.appendChild(sc);
  }
  ngOnDestroy(): void {
      window.localStorage.removeItem('token');
  }
}
