# AngularFrontEnd

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 17.3.2.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.

# setup For Project

## environments

STEP-1 :- create an <b>environments</b> folder in <b>src</b> </br>
STEP-2 :- create two files with name <b>environment.prod.ts</b> and <b>environment.ts</b> in environments folder</br>
STEP-3 :- put this code in it </br>
<code>
'''
    export const environment = {
  STRIPE_PUBLISHABLE_KEY : 'Your stripe public Key',
  STRIPE_SECRET_KEY: 'Your stripe secret key',
  GOOGLE_MAPS_API_KEY : 'Your google maps api key',
  TROASTR_STYLE:{progressBar:true,timeOut:2500},
  INACTIVE_TIME:1200000,
  BASE_URL:'Your Backend base url ex. "http://localhost:3000"'
};
'''
</code>

## angular.json

STEP-1 :- change style and script of test as well as build with </br>

<code>
'''
            "styles": [
              "@angular/material/prebuilt-themes/purple-green.css",
              "src/styles.css",
              "node_modules/bootstrap/dist/css/bootstrap.min.css",
              "node_modules/ngx-toastr/toastr.css",
              "node_modules/ngx-spinner/animations/square-spin.css"
            ],
            "scripts": [
              "node_modules/bootstrap/dist/js/bootstrap.bundle.min.js",
              "node_modules/bootstrap/dist/js/bootstrap.min.js"
            ]
            '''
</code>