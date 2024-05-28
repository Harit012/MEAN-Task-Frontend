import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Params } from '@angular/router';
import { UserGet } from './userGet.inerface';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(private http: HttpClient) {}

  getUsers(input: string, page: number) {
    let search: string = input;
    if (search == null || search == '' || search == ' ') {
      search = 'ThereIsNothing';
    }

    let params: Params = {
      input: search,
      page: page,
    };
    return this.http.get<{ users: UserGet[]; error: string }>(
      'http://localhost:3000/admin/users',
      { params: params, withCredentials: true }
    );
  }

  postUser(user: FormData) {
    return this.http.post<{ user: UserGet; error: string }>(
      'http://localhost:3000/admin/users',
      user,
      { withCredentials: true }
    );
  }

  updateUser(user: FormData) {
    return this.http.put<{ message: String; error: string }>(
      'http://localhost:3000/admin/users',
      user,
      { withCredentials: true }
    );
  }

  deleteUser(id: string) {
    const params: Params = {
      id: id,
    };
    return this.http.delete<{ message: string; error: string }>(
      'http://localhost:3000/admin/users',
      { params: params, withCredentials: true }
    );
  }
}
