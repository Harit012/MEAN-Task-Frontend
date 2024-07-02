import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { LoaderService } from '../admin-panel/loader.service';
import { environment } from '../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const loaderService = inject(LoaderService);
  // loaderService.subject.next(true);
  // console.log(loaderService.subject.observed.valueOf())
  // console.log(loaderService.subject.forEach(data => console.log(data)))
  if (
    req.headers.has('Authorization') ||
    req.url == `${environment.BASE_URL}/user/login`
  ) {
    return next(req);
  }
  if (localStorage.getItem('token')) {
    let authToken = localStorage.getItem('token');
    const authReq = req.clone({
      headers: req.headers.set('Authorization', 'Bearer ' + authToken),
    });
    return next(authReq);
  } else {
    return next(req);
  }
};
