import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ToastrModule, ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  toastr = inject(ToastrService);
  constructor(private router: Router, private http: HttpClient) {}

  userLogIn(form: { email: string; password: string }) {
    if (form.email != null && form.password != null) {
      this.http
        .post<{ token: string; error: string }>(
          'http://localhost:3000/user/login',
          form
        )
        .subscribe((res) => {
          if (res.token) {
            console.log(res.token);
            window.localStorage.setItem('token', res.token);
            this.router.navigate(['/admin']);
          } else {
            alert(res.error);
          }
        });
    } else {
      alert('Please Enter Email and Password');
      this.router.navigate(['/login']);
    }
  }
  userLogOut() {
    window.localStorage.removeItem('token');
    this.toastr.error('User is not verified', 'Error');
    this.router.navigate(['/login']);
  }
}
