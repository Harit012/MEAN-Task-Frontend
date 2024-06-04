import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Driver } from './driver.interface';
import { Params } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class DriverService {
  constructor(private http: HttpClient) {}

  getDrivers(page: number, sort: string, input: string) {
    if (input === null || input === '' || input === undefined) {
      var modifiedInput = 'ThereIsNothing';
    } else {
      modifiedInput = input;
    }
    let params: Params = {
      page: page,
      sort: sort,
      input: modifiedInput,
    };
    return this.http.get<{ drivers: Driver[]; error: string }>(
      'http://localhost:3000/admin/drivers/list',
      { params: params, withCredentials: true }
    );
  }

  postDriver(driver: FormData) {
    return this.http.post<{ driver: Driver; error: string }>(
      'http://localhost:3000/admin/drivers/list',
      driver,
      { withCredentials: true }
    );
  }

  deleteDriver(id: string) {
    const params: Params = {
      id: id,
    };
    return this.http.delete<{ message: string; error: string }>(
      'http://localhost:3000/admin/drivers/list',
      { params: params, withCredentials: true }
    );
  }

  approvelChange(id: string, approvel: boolean) {
    return this.http.patch<{ message: string; error: string }>(
      'http://localhost:3000/admin/drivers/list',
      { id: id, approvel: approvel },
      { withCredentials: true }
    );
  }

  putEditUser(formData: FormData) {
    return this.http.put<{ message: string; error: string }>(
      'http://localhost:3000/admin/drivers/list',
      formData,
      { withCredentials: true }
    );
  }

  patchServiceType(serviceType: string , id:string) {
    return this.http.patch<{message:string,error:string}>(
      'http://localhost:3000/admin/drivers/list/serviceType',
      {  id: id ,serviceType: serviceType  },
      { withCredentials: true }
    );
  }
}
