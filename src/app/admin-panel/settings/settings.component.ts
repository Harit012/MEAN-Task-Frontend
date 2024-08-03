import { Component, OnInit, inject } from '@angular/core';
import { SettingsService } from './settings.service';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../auth/auth.service';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../../environments/environment';
import { LoaderComponent } from '../../loader/loader.component';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, LoaderComponent, ReactiveFormsModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css',
})
export class SettingsComponent implements OnInit {
  formdata: FormData = new FormData();
  timeOutOptions: number[] = [10, 20, 30, 45, 60, 90];
  stopOptions: number[] = [1, 2, 3, 4, 5];
  selectedTimeOut!: number;
  selectedStops!: number;
  settingsForm!: FormGroup;
  toastr = inject(ToastrService);
  isLoader: boolean = false;
  constructor(
    private settingsService: SettingsService,
    private authService: AuthService
  ) {
    this.settingsForm = new FormGroup({
      timeOut: new FormControl(null, [Validators.required]),
      stops: new FormControl(null, [Validators.required]),
      mailerUser: new FormControl(null, [
        Validators.required,
        Validators.email,
      ]),
      mailerPassword: new FormControl(null, [Validators.required]),
      twilioAuthToken: new FormControl(null, [
        Validators.required,
        Validators.maxLength(32),
        Validators.minLength(32),
      ]),
      twilioAccountSid: new FormControl(null, [
        Validators.required,
        Validators.maxLength(34),
        Validators.minLength(34),
      ]),
      twilioPhoneNumber: new FormControl(null, [
        Validators.required,
        Validators.pattern('^[+][1-9]{1}[1-9]{1}[0-9]{9}$'),
      ]),
      stripePublishableKey: new FormControl(null, [
        Validators.required,
        Validators.minLength(107),
        Validators.maxLength(107),
      ]),
      stripeSecretKey: new FormControl(null, [
        Validators.required,
        Validators.minLength(107),
        Validators.maxLength(107),
      ]),
    });
  }

  ngOnInit(): void {
    this.isLoader = true;
    this.settingsService.getSettings().subscribe({
      next: (data) => {
        this.settingsForm.patchValue({
          timeOut: data.settings.timeOut,
          stops: data.settings.stops,
          mailerUser: data.settings.mailerUser,
          mailerPassword: data.settings.mailerPassword,
          twilioAuthToken: data.settings.twilioAuthToken,
          twilioAccountSid: data.settings.twilioAccountSid,
          twilioPhoneNumber: data.settings.twilioPhoneNumber,
          stripePublishableKey: data.settings.stripePublishableKey,
          stripeSecretKey: data.settings.stripeSecretKey,
        });
        this.settingsForm.markAsPristine();
      },
    });
  }

  onSaveChanges() {
    if (this.settingsForm.valid) {
      if (this.settingsForm.dirty) {
        this.settingsService.putSettings(this.settingsForm.value).subscribe({
          next: (data) => {
            this.toastr.success(`${data.message}`,"",environment.TROASTR_STYLE)
          }
        })
      } else {
        this.toastr.info('no changes made', 'Info', environment.TROASTR_STYLE);
      }
    } else {
      this.settingsForm.markAllAsTouched();
      this.toastr.error(
        'Please fill all required fields',
        'Error',
        environment.TROASTR_STYLE
      );
    }

    // console.log(this.settingsForm.getRawValue())
    // this.isLoader = true;
    // this.settingsService
    //   .putSettings(this.settingsForm.value)
    //   .subscribe({
    //     next: (data) => {
    //       if (data.message) {
    //         this.toastr.success(
    //           `${data.message}`,
    //           'Success',
    //           environment.TROASTR_STYLE
    //         )
    //         this.isLoader = false;
    //       }
    //     }
    //   });
  }
}
