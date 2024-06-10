import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { VehicleType } from './vehicle.interface';
import { AuthService } from '../../../auth/auth.service';
import { VehicleTypeService } from './vehicle-type.service';
import * as bootstrap from 'bootstrap';

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
  sizeValidation: boolean = false;
  vehicleTypes: string[] = ['SEDAN', 'SUV', 'MINI VAN', 'PICK UP'];

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private authService: AuthService,
    private vehicleTypeService: VehicleTypeService
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

    this.vehicleTypeService.postVehicleType(this.formdata)
      .subscribe((data) => {
        if (data.vehicles) {
          this.vehiclesList = data.vehicles;
          let toast = bootstrap.Toast.getOrCreateInstance(
            document.getElementById('SuccessToast') as HTMLElement
          );
          let inToast = document.getElementById('inToast') as HTMLElement;
          inToast.innerText = 'Vehicle Added Successfully';
          toast.show();
        } else if (data.varified == false) {
          alert('User is not verified');
          this.authService.userLogOut();
        } else if (data.error) {
          let toast = bootstrap.Toast.getOrCreateInstance(
            document.getElementById('FailureToast') as HTMLElement
          );
          let inToast = document.getElementById(
            'inFailureToast'
          ) as HTMLElement;
          inToast.innerText = data.error;
          toast.show();
        }
      });
    this.vehicleForm.reset();
    this.formdata = new FormData();
  }

  getVehiclesData() {
    this.vehicleTypeService.getVehicleTypes().subscribe((data) => {
      if (data.vehicle) {
        this.vehiclesList = data.vehicle;
      } else if (data.varified == false) {
        // alert('User is not verified');
        this.authService.userLogOut();
      } else if (data.error) {
        let toast = bootstrap.Toast.getOrCreateInstance(
          document.getElementById('FailureToast') as HTMLElement
        );
        let inToast = document.getElementById(
          'inFailureToast'
        ) as HTMLElement;
        inToast.innerText = data.error;
        toast.show();
      }
    });
  }

  onSubmitEdit() {
    this.formdata.append('type', this.vehicleForm.value.type);

    this.vehicleTypeService.putVehicleType(this.formdata)
      .subscribe(
        (res) => {
          if (res.vehicles) {
            let toast = bootstrap.Toast.getOrCreateInstance(
              document.getElementById('SuccessToast') as HTMLElement
            );
            let inToast = document.getElementById('inToast') as HTMLElement;
            inToast.innerText = 'vehicle Updated Successfully';
            toast.show();
            this.vehiclesList = res.vehicles;
          } else if (res.varified == false) {
            // alert('User is not verified');
            this.authService.userLogOut();
            return;
          } else if (res.error) {
            let toast = bootstrap.Toast.getOrCreateInstance(
              document.getElementById('FailureToast') as HTMLElement
            );
            let inToast = document.getElementById(
              'inFailureToast'
            ) as HTMLElement;
            inToast.innerText = res.error;
            toast.show();
          }
        },
        (err) => {
          alert(err);
        }
      );
    this.onCancel();
  }
  onFileChange(event: any) {
    if (event.target.files && event.target.files.length) {
      if (event.target.files[0].size < 4000000) {
        this.sizeValidation = false;
        // this.formdata= new FormData();
        this.formdata.append('vehicleImage', event.target.files[0]);
      } else {
        let toast = bootstrap.Toast.getOrCreateInstance(
          document.getElementById('FailureToast') as HTMLElement
        );
        let inToast = document.getElementById(
          'inFailureToast'
        ) as HTMLElement;
        inToast.innerText = "file is too large try to upload smaller file";
        toast.show();
        this.sizeValidation = true;
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
      
      this.vehicleTypeService.deleteVehicleType(this.vehiclesList[index]._id)
        .subscribe(
          (res) => {
            if (res.vehicles) {
              let toast = bootstrap.Toast.getOrCreateInstance(
                document.getElementById('SuccessToast') as HTMLElement
              );
              let inToast = document.getElementById('inToast') as HTMLElement;
              inToast.innerText = 'Vehicle deleted Successfully';
              toast.show();
              this.vehiclesList = res.vehicles;
            } else if (res.varified == false) {
              // alert('User is not verified');
              this.authService.userLogOut();
              return;
            } else if (res.error) {
              let toast = bootstrap.Toast.getOrCreateInstance(
                document.getElementById('FailureToast') as HTMLElement
              );
              let inToast = document.getElementById(
                'inFailureToast'
              ) as HTMLElement;
              inToast.innerText = res.error;
              toast.show();
            }
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
