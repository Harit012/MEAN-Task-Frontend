import { ApplicationConfig } from '@angular/core';
import { Router, provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { GoogleMapsModule } from '@angular/google-maps';
import { provideNgxStripe } from 'ngx-stripe';
import { environment } from '../environments/environment';
import { authInterceptor } from './auth/auth.interceptor';
import { provideToastr } from 'ngx-toastr';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    Router,
    GoogleMapsModule,
    provideNgxStripe(environment.STRIPE_PUBLISHABLE_KEY),
    provideAnimations(),
    
    provideToastr()
  ],
};
