import { Routes } from '@angular/router';
import { UserLoginComponent } from './auth/user-login/user-login.component';
import { authorizationGuard } from './auth/authorization.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    component: UserLoginComponent,
  },
  {
    path: 'admin',
    canActivate: [authorizationGuard],
    canActivateChild: [authorizationGuard],
    loadComponent: () =>
      import('./admin-panel/admin-panel.component').then(
        (m) => m.AdminPanelComponent
      ),
    children: [
      {
        path: 'ride/create-ride',
        loadComponent: () =>
          import(
            './admin-panel/Rides/create-rides/create-rides.component'
          ).then((m) => m.CreateRidesComponent),
      },
      {
        path: 'ride/confirmed-rides',
        loadComponent: () =>
          import(
            './admin-panel/Rides/confirmed-rides/confirmed-rides.component'
          ).then((m) => m.ConfirmedRidesComponent),
      },
      {
        path: 'ride/ride-history',
        loadComponent: () =>
          import(
            './admin-panel/Rides/ride-history/ride-history.component'
          ).then((m) => m.RideHistoryComponent),
      },
      {
        path: 'users',
        loadComponent: () =>
          import('./admin-panel/users/users.component').then(
            (m) => m.UsersComponent
          ),
      },
      {
        path: 'drivers/list',
        loadComponent: () =>
          import('./admin-panel/Drivers/list/list.component').then(
            (m) => m.ListComponent
          ),
      },
      {
        path: 'drivers/running-request',
        loadComponent: () =>
          import(
            './admin-panel/Drivers/running-request/running-request.component'
          ).then((m) => m.RunningRequestComponent),
      },
      {
        path: 'pricing/city',
        loadComponent: () =>
          import('./admin-panel/Pricing/city/city.component').then(
            (m) => m.CityComponent
          ),
      },
      {
        path: 'pricing/country',
        loadComponent: () =>
          import('./admin-panel/Pricing/country/country.component').then(
            (m) => m.CountryComponent
          ),
      },
      {
        path: 'pricing/vehicle-type',
        loadComponent: () =>
          import(
            './admin-panel/Pricing/vehicle-type/vehicle-type.component'
          ).then((m) => m.VehicleTypeComponent),
      },
      {
        path: 'pricing/vehicle-pricing',
        loadComponent: () =>
          import(
            './admin-panel/Pricing/vehicle-pricing/vehicle-pricing.component'
          ).then((m) => m.VehiclePricingComponent),
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./admin-panel/settings/settings.component').then(
            (m) => m.SettingsComponent
          ),
      },
    ],
  },
];
