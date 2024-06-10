import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import * as bootstrap from 'bootstrap';

@Component({
  selector: 'app-user-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './user-login.component.html',
  styleUrl: './user-login.component.css',
})
export class UserLoginComponent {
  form: FormGroup;
  constructor(private router: Router, private http: HttpClient,private authservice: AuthService) {
    this.form = new FormGroup({
      email: new FormControl(null, [Validators.required, Validators.email]),
      password: new FormControl(null, [Validators.required]),
    });
  }

  onSubmit() {
    if (this.form.valid) {
      this.authservice.userLogIn(this.form.value);
    }else{
      let toast = bootstrap.Toast.getOrCreateInstance(
        document.getElementById('FailureToast') as HTMLElement
      )
      let inToast = document.getElementById('inFailureToast') as HTMLElement;
      inToast.innerText ="Plese Enter Email And Password";
      toast.show();
      this.form.reset()
    }
  }
}
