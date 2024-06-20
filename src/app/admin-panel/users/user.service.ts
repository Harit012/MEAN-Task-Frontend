import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Params } from '@angular/router';
import { UserGet } from './userGet.inerface';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(private http: HttpClient) {}

  getUsers(input: string, page: number , sort: string) {
    let search: string = input;
    if (search == null || search == '' || search == ' ') {
      search = 'ThereIsNothing';
    }
    let params: Params = {
      input: search,
      page: page,
      sort : sort
    };
    return this.http.get<{ users: UserGet[]; status: string }>(
      `${environment.BASE_URL}/admin/users`,
      { params: params, withCredentials: true }
    );
  }

  postUser(user: FormData) {
    return this.http.post<{ user: UserGet; status: string}>(
      `${environment.BASE_URL}/admin/users`,
      user,
      { withCredentials: true }
    );
  }

  updateUser(user: FormData) {
    return this.http.put<{ message: string; status: string}>(
      `${environment.BASE_URL}/admin/users`,
      user,
      { withCredentials: true }
    );
  }

  deleteUser(id: string, customerId: string) {
    const params: Params = {
      id: id,
      customerId: customerId
    };
    return this.http.delete<{ message: string; status: string}>(
      `${environment.BASE_URL}/admin/users`,
      { params: params, withCredentials: true }
    );
  }
}
