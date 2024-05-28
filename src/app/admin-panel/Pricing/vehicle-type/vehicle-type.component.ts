import { CommonModule } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { VehicleType } from './vehicle.interface';
import { Router } from '@angular/router';
import { AuthService } from '../../../auth/auth.service';

@Component({
  selector: 'app-vehicle-type',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './vehicle-type.component.html',
  styleUrl: './vehicle-type.component.css',
})
export class VehicleTypeComponent implements OnInit {
  vehicleForm: FormGroup;
  vehiclesList: VehicleType[] = [];
  image: File | null = null;
  formdata: FormData = new FormData();
  isEdit: boolean = false;
  selectedImg: string = '';
  sizeValidation : boolean = false;
  vehicleTypes: string[] = ['SEDAN', 'SUV', 'MINI VAN', 'PICK UP'];

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private authService: AuthService
  ) {
    this.vehicleForm = this.fb.group({
      vehicleImage: new FormControl(null, [Validators.required]),
      type: new FormControl(null, [Validators.required]),
    });
  }
  ngOnInit(): void {
    this.getVehiclesData();
  }

  onSubmit() {
    this.formdata.append('type', this.vehicleForm.value.type);
    console.log(this.formdata);

    this.http
      .post<{ vehicles: VehicleType[] }>(
        'http://localhost:3000/admin/pricing/vehicle-type',
        this.formdata,
        {
          withCredentials: true,
        }
      )
      .subscribe((data) => {
        this.vehiclesList = data.vehicles;
      });
    this.vehicleForm.reset();
    this.formdata = new FormData();
  }

  getVehiclesData() {
    this.http
      .get<{ vehicle: VehicleType[] }>(
        'http://localhost:3000/admin/pricing/vehicle-type',
        {
          withCredentials: true,
        }
      )
      .subscribe((data) => {
        if (data.vehicle) {
          this.vehiclesList = data.vehicle;
        } else {
          this.authService.userLogOut();
          this.router.navigate(['/login']);
        }
      });
  }

  onSubmitEdit() {
    this.formdata.append('type', this.vehicleForm.value.type);

    this.http
      .put<{ vehicles: VehicleType[] }>(
        'http://localhost:3000/admin/pricing/vehicle-type',
        this.formdata,
        {
          withCredentials: true,
        }
      )
      .subscribe(
        (res) => {
          this.vehiclesList = res.vehicles;
        },
        (err) => {
          console.log(err);

          alert(err);
        }
      );
    this.onCancel();
  }
  onFileChange(event: any) {
    if (event.target.files && event.target.files.length) {
      if(event.target.files[0].size < 4000000 ){
        this.sizeValidation= false;
        this.formdata.append('vehicleImage', event.target.files[0]);
      }else{
        this.sizeValidation= true;
        this.vehicleForm.reset();
      }

    }
  }

  onEdit(index: number) {
    this.isEdit = true;
    let obj = this.vehiclesList[index];
    this.formdata.append('id', obj._id);
    this.formdata.append('prvImg', obj.vehicleImage);

    this.vehicleForm.patchValue({
      type: this.vehiclesList[index].type,
    });
  }
  onDelete(index: number) {
    if (confirm('Are you sure want to delete?')) {
      let params = new HttpParams().set('id', this.vehiclesList[index]._id);

      // console.log(params);
      this.http
        .delete<{ vehicles: VehicleType[] }>(
          'http://localhost:3000/admin/pricing/vehicle-type',
          {
            params: params,
            withCredentials: true,
          }
        )
        .subscribe(
          (res) => {
            this.vehiclesList = res.vehicles;
          },
          (err) => {
            console.log(err);
          }
        );
    }
  }

  onCancel() {
    this.isEdit = false;
    this.formdata = new FormData();
    this.vehicleForm.reset();
  }
}
