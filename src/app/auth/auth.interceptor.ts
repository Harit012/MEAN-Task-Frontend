import { HttpEventType, HttpInterceptorFn } from '@angular/common/http';
import { catchError, map, tap } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (
    req.headers.has('Authorization') ||
    req.url == 'http://localhost:3000/user/login'
  ) {
    // console.log(req.url)
    return next(req)
    .pipe(
      tap((res:any)=>{
        
        console.log(res)
        if(res.status == 401){
          console.log(`${res.body.message}`);
          
        }
      })
    );
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



      // catchError((error) => {
      //   console.log(error);
      //   return next(error);
      // })