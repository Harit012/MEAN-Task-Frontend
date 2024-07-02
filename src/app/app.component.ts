import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { UserLoginComponent } from './auth/user-login/user-login.component';
import { environment } from '../environments/environment';
import { LoaderComponent } from './loader/loader.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, UserLoginComponent,LoaderComponent],
  templateUrl: './app.component.html',
})
export class AppComponent implements OnDestroy, OnInit {
  // isLoader: boolean = false;

  // constructor(public loaderService: LoaderService) {}
  ngOnInit(): void {
    let sc = document.createElement('script');
    sc.src = `https://maps.googleapis.com/maps/api/js?key=${environment.GOOGLE_MAPS_API_KEY}&libraries=marker,places,drawing,geometry&v=weekly&loading=async`;
    sc.type = 'text/javascript';
    document.body.appendChild(sc);

    // this.loaderService.subject.subscribe((data) => {
    //   this.isLoader = data;
    //   let loaderDiv = document.getElementById('loader') as HTMLElement;
    //   if (this.isLoader) {
    //     loaderDiv.style.display = 'block';
    //   } else {
    //     loaderDiv.style.display = 'none';
    //   }
    // });
  }

  ngOnDestroy(): void {
    window.localStorage.removeItem('token');
  }
}
