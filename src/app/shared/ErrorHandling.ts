import { inject } from "@angular/core";
import { AuthService } from "../auth/auth.service";
import { ToastrService } from "ngx-toastr";
import { environment } from "../../environments/environment";

export class ErrorHandling {

    static authService:AuthService = inject(AuthService);

    static toastr:ToastrService = inject(ToastrService);

    static commonErrorHandler(err:any) {
    if (!err.error.status) {
      this.toastr.error(
        `Error while sending request to server`,
        'Error',
        environment.TROASTR_STYLE
      );
    } else if (err.error.status == 'Failure') {
      if (err.status == 401) {
        this.authService.userLogOut();
      } else {
        this.toastr.error(
          `${err.error.message}`,
          'Error',
          environment.TROASTR_STYLE
        );
      }
    } else {
      this.toastr.error(
        `Unknown Error`,
        'Error',
        environment.TROASTR_STYLE
      );
    }
  }
}