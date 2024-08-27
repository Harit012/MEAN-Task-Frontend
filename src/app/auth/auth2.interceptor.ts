// import {
//   HttpHandlerFn,
//   HttpRequest,
// } from '@angular/common/http';
// import {  catchError, tap, throwError } from 'rxjs';
// import { inject } from '@angular/core';
// import { ToastrService } from 'ngx-toastr';
// import { AuthService } from './auth.service';
// import { environment } from '../../environments/environment';
// import { LoaderService } from '../admin-panel/loader.service';

// export const auth2Interceptor = (
//   req: HttpRequest<any>,
//   next: HttpHandlerFn
// ) => {
//   let toastr = inject(ToastrService);
//   let authService = inject(AuthService);
//   // let loaderService = inject(LoaderService);
//   // loaderService.subject.next(true);
//   // console.log(req)
//   // console.log(loaderService.subject);
//   return next(req).pipe(

//     // tap(() => loaderService.subject.next(false)),
//     // tap(() => console.log(`==========================================================================`)),
//     catchError((err) => {
//       // console.log(err)
//         if (!err.error.success == false) {
//           toastr.error(
//             `Error while sending request to server`,
//             `Error :- ${err.status}`,
//             environment.TROASTR_STYLE
//           );
//         } else if (err.error.success == false) {
//           if (err.status == 401) {
//             authService.userLogOut();
//           } else {
//             toastr.error(
//               `${err.error.message}`,
//               `Error :- ${err.status}`,
//               environment.TROASTR_STYLE
//             );
//           }
//         } else {
//           toastr.error(
//             `Unknown Error`,
//             `Error :- ${err.status}`,
//             environment.TROASTR_STYLE
//           );
//         }
//         // loaderService.subject.next(false)
//         return throwError(() => new Error('Something went wrong'));
//     }),
//   );
// };

import { HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { catchError, tap, throwError } from 'rxjs';
import { inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

import { LoaderService } from '../admin-panel/loader.service';

export const auth2Interceptor = (
  req: HttpRequest<any>,
  next: HttpHandlerFn
) => {
  const toastr = inject(ToastrService);
  const authService = inject(AuthService);
  const loaderService = inject(LoaderService);

  loaderService.showLoader(); // Start loader when request leaves frontend

  return next(req).pipe(
    tap(() => loaderService.hideLoader()), // Hide loader on successful response
    catchError((err) => {
      console.log(err.status)
      if (!err.error.success == false) {
        toastr.error(
          `Error while sending request to server`,
          `Error :- ${err.status}`,
          environment.TROASTR_STYLE
        );
      } else if (err.error.success == false) {
        if (err.status == 401) {
          authService.userLogOut();
        } else {
          toastr.error(
            `${err.error.message}`,
            `Error :- ${err.status}`,
            environment.TROASTR_STYLE
          );
        }
      }else if(err.status == 404){
        toastr.error(
          `${err.error.message}`,
          `Error :- ${err.status}`,
          environment.TROASTR_STYLE
        );
      } 
      else {
        toastr.error(
          `Unknown Error`,
          `Error :- ${err.status}`,
          environment.TROASTR_STYLE
        );
      }
      loaderService.hideLoader(); // Hide loader on error
      return throwError(() => new Error('Something went wrong'));
    })
  );
};
