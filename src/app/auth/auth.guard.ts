import { inject } from '@angular/core';
import { CanActivateChildFn, CanActivateFn, Router} from '@angular/router';

export const authGuard: CanActivateChildFn = (route, state ) => {
  var router = inject(Router);
  if(!document.cookie.includes('token')){
    alert("Please Login First")
    router.navigate(['/login']);
    return false;
  }
  else{
    return true;
  }
};
