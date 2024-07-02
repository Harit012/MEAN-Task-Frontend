import { Injectable, NgZone } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root',
})
export class InactivityService {
  private userActivity: Subject<any> = new Subject();
  private inactivityTime: number = 3000000; // 20 minutes
  private userInactive: Subject<any> = new Subject();

  constructor(private ngZone: NgZone,private authService: AuthService) {
    this.setInactivityTimer();
    this.userActivity
      .pipe(debounceTime(this.inactivityTime))
      .subscribe(() => this.userInactive.next(undefined));
    this.userInactive.subscribe(() => this.onUserInactive());
  }

  public setInactivityTimer() {
    this.ngZone.runOutsideAngular(() => {
      const events = [
        'mousemove',
        'mousedown',
        'keypress',
        'touchstart',
        'scroll',
      ];

      events.forEach((event) => {
        document.addEventListener(
          event,
          () => this.userActivity.next(undefined),
          { passive: true }
        );
      });
    });
  }

  private onUserInactive() {
    console.log('User is inactive');
    this.ngZone.run(()=>{
      this.authService.logOutForcefully();
    })
  }
}
