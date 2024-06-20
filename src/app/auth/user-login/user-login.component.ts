import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthService } from '../auth.service';
import { ToastrService } from 'ngx-toastr';
import { LoaderComponent } from '../../loader/loader.component';

@Component({
  selector: 'app-user-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule,LoaderComponent],
  templateUrl: './user-login.component.html',
  styleUrl: './user-login.component.css',
})
export class UserLoginComponent {
  form: FormGroup;
  toastr= inject(ToastrService);
  isLoader: boolean = false
  constructor(private authservice: AuthService) {
    this.form = new FormGroup({
      email: new FormControl(null, [Validators.required, Validators.email]),
      password: new FormControl(null, [Validators.required]),
    });
  }

  onSubmit() {
    if (this.form.valid) {
      this.authservice.userLogIn(this.form.value);
    }else{
      this.toastr.error('Please Enter valid Email and Password')
      this.form.reset()
    }
  }
}
