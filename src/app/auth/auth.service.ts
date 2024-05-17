import { Injectable } from '@angular/core';
import { routes } from '../app.routes';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class AuthService {

constructor(private router: Router,private http: HttpClient) {}

    userLogIn(form:{email: string, password: string}) {
        if (form.email != null && form.password != null) {
          this.http
          .post<{ token: string; error: string }>(
            'http://localhost:3000/user/login',
            form
          )
          .subscribe((res) => {
            if (res.token) {
              document.cookie = `token=${res.token};`;
              this.router.navigate(['/admin']);
            } else {
              alert(res.error);
            }
          });
        }else{
          alert("Please Enter Email and Password");
          this.router.navigate(['/login']);
        }
    }
    userLogOut() {
        document.cookie = 'token=; expires=Thu, 01 Jan 2000 00:00:00 UTC; path=/;';
        this.router.navigate(['/login']);
    }

    
}
