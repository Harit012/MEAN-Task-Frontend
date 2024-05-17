import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authorizationGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  if(document.cookie.includes('token')){
    return true;
  }
  else{
    alert("You are not logged in");
    router.navigate(['/login']);
    return false;
  }
};
