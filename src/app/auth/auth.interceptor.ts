import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (
    req.headers.has('Authorization') ||
    req.url == 'http://localhost:3000/user/login'
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