import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PushNotificationsService {
  public permission: Permission;

  constructor() {
    this.permission = this.isSupported() ? 'default' : 'denied';
  }

  public isSupported(): boolean {
    return 'Notification' in window;
  }

  requestPermission(): void {
    if (this.isSupported()) {
      Notification.requestPermission(status => {
        this.permission = status;
      });
    }
  }

  create(title: string, options?: any): Observable<any> {
    return new Observable(obs => {
      if (!this.isSupported()) {
        console.log('Notifications are not available in this environment');
        obs.complete();
      } else if (this.permission !== 'granted') {
        console.log("The user hasn't granted you permission to send push notifications");
        obs.complete();
      } else {
        const _notify = new Notification(title, options);
        _notify.onshow = (e) => {
          obs.next({ notification: _notify, event: e });
        };
        
        _notify.onclick = (e) => {
          obs.next({ notification: _notify, event: e });
        };
        
        _notify.onerror = (e) => {
          obs.error({ notification: _notify, event: e });
        };
        
        _notify.onclose = () => {
          obs.complete();
        };

        // Play sound if provided
        if (options && options.sound) {
          const audio = new Audio(options.sound);
          audio.play();
        }
      }
    });
  }

  generateNotification(source: Array<any>): void {
    source.forEach(item => {
      const options = {
        body: item.body,
        // icon: 'https://angular.io/assets/images/logos/angular/angular.svg',
        icon: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRh8VGfy1GKL5vwnciBKTzhkWZ5mzVKDH9wGQ&s',
        sound: '../../assets/sounds/pop-up_sound.mp3',
        // sound: '../../assets/sounds/fullspeed.mp3',
        tag: 'completed',
        data: 'This is Push Notification',
        renotify: false,
        silent: false,
        noscreen: false,
        sticky: true,
        dir: 'rtl',
        lang: 'en-US',
        vibrate: [200, 100, 200]
      };
    this.create(item.title, options).subscribe();
    });
  }
}

export declare type Permission = 'denied' | 'granted' | 'default';