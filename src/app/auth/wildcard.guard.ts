import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const wildcardGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
    if(window.localStorage.getItem('token')){
      return true;
    }
    else{
      router.navigate(['/login']);
      return false;
    }
};
