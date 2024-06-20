// import { AuthService } from "../auth/a
// export  class ErrorHandling {
//   static authService: any;
//   static toastr: any;
//   constructor(public authService:AuthService,public toastr:ToastrService){}
//     static authService:AuthService = inject(AuthService);

//     static toastr:ToastrService = inject(ToastrService);

//     static commonErrorHandler(err:any) {
//     if (!err.error.status) {
//       this.toastr.error(
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