import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Driver } from './driver.interface';
import { Params } from '@angular/router';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class DriverService {
  constructor(private http: HttpClient) {}

  getDrivers(page: number, sort: string, input: string) {
    let modifiedInput =""
    if (input === null || input === '' || input === undefined) {
      modifiedInput = 'ThereIsNothing';
    } else {
      modifiedInput = input;
    }
    let params: Params = {
      page: page,
      sort: sort ,
      input: modifiedInput,
    };
    return this.http.get<{ drivers: Driver[]; success: boolean}>(
      'http://localhost:3000/admin/drivers/list',
      { params: params, withCredentials: true }
    );
  }

  postDriver(driver: FormData) {
    return this.http.post<{ driver: Driver; success: boolean}>(
      `${environment.BASE_URL}/admin/drivers/list`,
      driver,
      { withCredentials: true }
    );
  }

  deleteDriver(id: string , driver_stripe_id: string) {
    const params: Params = {
      id: id,
      driver_stripe_id: driver_stripe_id
    };
    return this.http.delete<{ message: string; success: boolean }>(
       `${environment.BASE_URL}/admin/drivers/list`,
      { params: params, withCredentials: true }
    );
  }

  approvelChange(id: string, approvel: boolean) {
    return this.http.patch<{ message: string; success: boolean}>(
      `${environment.BASE_URL}/admin/drivers/list`,
      { id: id, approvel: approvel },
      { withCredentials: true }
    );
  }

  putEditUser(formData: FormData) {
    return this.http.put<{ message: string; success: boolean}>(
      `${environment.BASE_URL}/admin/drivers/list`,
      formData,
      { withCredentials: true }
    );
  }

  patchServiceType(serviceType: string , id:string) {
    return this.http.patch<{message:string,success: boolean}>(
      `${environment.BASE_URL}/admin/drivers/list/serviceType`,
      {  id: id ,serviceType: serviceType  },
      { withCredentials: true }
    );
  }

  addBankAccount(AccountObj: object) {
    return this.http.post<{ message: string; success: boolean}>(
      `${environment.BASE_URL}/admin/drivers/list/addBankAccount`,
      AccountObj,
      { withCredentials: true }
    );
  }

  getAllAccounts(customerId: string) {
    return this.http.get<{ data: any }>(
      `https://api.stripe.com/v1/accounts/${customerId}`,
      {headers:{Authorization:`Bearer ${environment.STRIPE_SECRET_KEY}`} }
    )
  }
}
