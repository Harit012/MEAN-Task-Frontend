import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [NgxSpinnerModule],
  template: `
    <ngx-spinner
    style="color: aliceblue;fontweight: bold;"
      bdColor="rgba(39, 40, 34, 0.8)"
      size="medium"
      color="rgb(216, 221, 226)"
      type="square-spin"
      [fullScreen]="true"
      >Loading . . .</ngx-spinner
    >
  `,
})
export class LoaderComponent implements OnInit, OnDestroy {
  spinner = inject(NgxSpinnerService);
  ngOnInit() {
    this.spinner.show();
    setTimeout(() => {
      this.spinner.hide();
    }, 10000);
  }
  ngOnDestroy(): void {
    this.spinner.hide();
  }
}
