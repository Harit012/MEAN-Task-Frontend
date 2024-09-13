import { ApplicationConfig } from '@angular/core';
import { Router, provideRouter, withHashLocation } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { GoogleMapsModule } from '@angular/google-maps';
import { provideNgxStripe } from 'ngx-stripe';
import { environment } from '../environments/environment';
import { authInterceptor } from './auth/auth.interceptor';
import { provideToastr } from 'ngx-toastr';
import { auth2Interceptor } from './auth/auth2.interceptor';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withHashLocation()),
    provideHttpClient(withInterceptors([authInterceptor, auth2Interceptor])),
    Router,
    GoogleMapsModule,
    provideNgxStripe(environment.STRIPE_PUBLISHABLE_KEY),
    provideAnimations(),
    provideAnimationsAsync(),
    provideToastr(),
  ],
};
