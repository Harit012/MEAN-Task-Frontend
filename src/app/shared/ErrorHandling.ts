// import { inject } from "@angular/core";
// import { environment } from "../../environments/environment";
// import { AuthService } from "../auth/auth.service";
// import { ToastrService } from "ngx-toastr";
// export  class ErrorHandling {
//     static toastr= inject(ToastrService);
//     static authService: any;
// //   static authService: any;
// //   static toastr: any;
//   constructor(){}
//     // static authService:AuthService = inject(AuthService);
//     // this.toastr = inject(ToastrService);

//     // static toastr:ToastrService = inject(ToastrService);

//     static commonErrorHandler(err:any) {
//     if (!err.error.status) {
//         ErrorHandling.toastr.error(
//         `Error while sending request to server`,
//         'Error',
//         environment.TROASTR_STYLE
//       );
//     } else if (err.error.status == 'Failure') {
//       if (err.status == 401) {
//         this.authService.userLogOut();
//       } else {
//         this.toastr.error(
//           `${err.error.message}`,
//           'Error',
//           environment.TROASTR_STYLE
//         );
//       }
//     } else {
//       this.toastr.error(
//         `Unknown Error`,
//         'Error',
//         environment.TROASTR_STYLE
//       );
//     }
//   }
// }