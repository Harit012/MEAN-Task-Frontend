import {
  HttpHandlerFn,
  HttpRequest,
} from '@angular/common/http';
import {  catchError, throwError } from 'rxjs';
import { inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

export const auth2Interceptor = (
  req: HttpRequest<any>,
  next: HttpHandlerFn
) => {
  let toastr = inject(ToastrService);
  let authService = inject(AuthService);
  // console.log("Auth 2 called")
  return next(req).pipe(
    catchError((err) => {
        if (!err.error.status) {
          toastr.error(
            `Error while sending request to server`,
            `Error :- ${err.status}`,
            environment.TROASTR_STYLE
          );
        } else if (err.error.status == 'Failure') {
          if (err.status == 401) {
            authService.userLogOut();
          } else {
            toastr.error(
              `${err.error.message}`,
              `Error :- ${err.status}`,
              environment.TROASTR_STYLE
            );
          }
        } else {
          toastr.error(
            `Unknown Error`,
            `Error :- ${err.status}`,
            environment.TROASTR_STYLE
          );
        }
        // loaderService.subject.next(false)
        return throwError(() => new Error('Something went wrong'));
    }),
    // tap(() => loaderService.subject.next(false)),
  );
};
