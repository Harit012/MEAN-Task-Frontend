import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
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
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../../../environments/environment';

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
  toastr = inject(ToastrService)

  constructor(
    private fb: FormBuilder,
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

    this.vehicleTypeService.postVehicleType(this.formdata).subscribe({
      next: (data) => {
        if (data.vehicles) {
          this.toastr.success('Vehicle-type added', 'Success',environment.TROASTR_STYLE);
          this.vehiclesList = data.vehicles;
        } else if (data.varified == false) {
          this.authService.userLogOut();
        } else if (data.error) {
          this.toastr.error(`Error From Backend:- ${data.error}`, 'Error',environment.TROASTR_STYLE);
        }
      },
      error: (err) => {
        this.toastr.error(`Unable to fetch data:- ${err.message}`, 'Error',environment.TROASTR_STYLE);
      },
    });
    this.vehicleForm.reset();
    this.formdata = new FormData();
  }

  getVehiclesData() {
    this.vehicleTypeService.getVehicleTypes().subscribe({
      next: (data) => {
        if (data.vehicle) {
          this.vehiclesList = data.vehicle;
        } else if (data.varified == false) {
          this.authService.userLogOut();
        } else if (data.error) {
          this.toastr.error(`Error From Backend:- ${data.error}`, 'Error');
        }
      },
      error: (err) => {
        this.toastr.error(`Unable to fetch data:- ${err.message}`, 'Error');
      },
    });
  }

  onSubmitEdit() {
    this.formdata.append('type', this.vehicleForm.value.type);
    if(this.vehicleForm.dirty){
      this.vehicleTypeService.putVehicleType(this.formdata).subscribe({
        next: (res) => {
          if (res.vehicles) {
            this.toastr.success('Vehicle-type updated', 'Success',environment.TROASTR_STYLE);
            this.vehiclesList = res.vehicles;
          } else if (res.varified == false) {
            this.authService.userLogOut();
            return;
          } else if (res.error) {
            this.toastr.error(`Error From Backend:- ${res.error}`, 'Error',environment.TROASTR_STYLE);
          }
        },
        error: (err) => {
          this.toastr.error(`Unable to fetch data:- ${err.message}`, 'Error',environment.TROASTR_STYLE);
        },
      });
    }else{
      this.toastr.info('No changes made','Info',environment.TROASTR_STYLE)
    }
    this.onCancel();
  }
  onFileChange(event: any) {
    if (event.target.files && event.target.files.length) {
      if (event.target.files[0].size < 4000000) {
        this.sizeValidation = false;
        // this.formdata= new FormData();
        this.formdata.append('vehicleImage', event.target.files[0]);
      } else {
        this.toastr.warning(
          'file is too large try to upload smaller file',
          'Warning',environment.TROASTR_STYLE
        );
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
      this.vehicleTypeService
        .deleteVehicleType(this.vehiclesList[index]._id)
        .subscribe({
          next: (res) => {
            if (res.vehicles) {
              this.toastr.success('Vehicle-type deleted', 'Success',environment.TROASTR_STYLE);
              this.vehiclesList = res.vehicles;
            } else if (res.varified == false) {
              this.authService.userLogOut();
              return;
            } else if (res.error) {
              this.toastr.error(`Error From Backend:- ${res.error}`, 'Error',environment.TROASTR_STYLE);
            }
          },
          error: (err) => {
            this.toastr.error(`Unable to fetch data:- ${err.message}`, 'Error',environment.TROASTR_STYLE);
          },
        });
    }
  }

  onCancel() {
    this.isEdit = false;
    this.formdata = new FormData();
    this.vehicleForm.reset();
  }
}
