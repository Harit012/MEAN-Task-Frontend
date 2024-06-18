import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  toastr = inject(ToastrService);
  constructor(private router: Router, private http: HttpClient) {}

  userLogIn(form: { email: string; password: string }) {
    if (form.email != null && form.password != null) {
      try{
        this.http
        .post<{ token: string; error: string }>(
          'http://localhost:3000/user/login',
          form
        )
        .subscribe({
          next:(res) => {
            // console.log(res)
            if (res.token) {
              // console.log(res.token);
              window.localStorage.setItem('token', res.token);
              this.router.navigate(['/admin']);
              this.toastr.success('User Logged In Successfully', 'Success',{progressBar: true, timeOut:5000});
            } else {
              this.toastr.error(`${res.error}`, "Error",environment.TROASTR_STYLE);
              console.log(res.error);
            }
          },
          error:(err)=>{
            this.toastr.error(`Unable to Fetch data:- ${err.message}`, 'Error',environment.TROASTR_STYLE);
            console.log(err)
          }
        });
      }catch(err){
        this.toastr.error(`In catch block`, "Error",environment.TROASTR_STYLE);
      }
      
    } else {
      alert('Please Enter Email and Password');
      this.router.navigate(['/login']);
    }
  }
  userLogOut() {
    window.localStorage.removeItem('token');
    this.toastr.error('User is not verified', 'Error',{progressBar: true, timeOut:5000});
    this.router.navigate(['/login']);
  }
  logOutManually(){
    window.localStorage.removeItem('token');
    this.toastr.success('Logged Out Successfully', 'Success',{progressBar: true, timeOut:5000});
    this.router.navigate(['/login']);
  }
  logOutForcefully(){
    window.localStorage.removeItem('token');
    this.toastr.error(`You were Inactive for ${(environment.INACTIVE_TIME/1000)} seconds`, 'Error',{progressBar: true, timeOut:5000});
    this.router.navigate(['/login']);
  }
}
