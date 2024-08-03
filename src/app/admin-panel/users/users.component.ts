import { CommonModule } from '@angular/common';
import {
  AfterViewChecked,
  Component,
  OnInit,
  ViewChild,
  inject,
} from '@angular/core';
import { CountriesService } from '../Pricing/country/countries.service';
import { Country } from '../Pricing/country/country.interface';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { UserService } from './user.service';
import { UserGet } from './userGet.inerface';
import * as bootstrap from 'bootstrap';
import { Card } from './card.interface';
import { CardService } from './card.service';
import {
  NgxStripeModule,
  StripeCardComponent,
  StripeElementsDirective,
  StripeService,
} from 'ngx-stripe';
import {
  StripeCardElementOptions,
  StripeElementsOptions,
} from '@stripe/stripe-js';
import { AuthService } from '../../auth/auth.service';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../../environments/environment';
import { LoaderComponent } from '../../loader/loader.component';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    StripeElementsDirective,
    StripeCardComponent,
    NgxStripeModule,
    LoaderComponent,
  ],
  templateUrl: './users.component.html',
  styleUrl: './users.component.css',
})
export class UsersComponent implements OnInit, AfterViewChecked {
  userForm: FormGroup;
  formdata: FormData = new FormData();
  selectedCountry!: Country;
  countryList: Country[] = [];
  cardList: Card[] = [];
  usersList: UserGet[] = [];
  countryCode!: string;
  searchInput: string = '';
  currentPage: number = 0;
  customerId!: string;
  editMode: boolean = false;
  wantToAddCard: boolean = false;
  sortMethod: string = 'none';
  @ViewChild(StripeCardComponent) card!: StripeCardComponent;

  cardOptions: StripeCardElementOptions = {
    style: {
      base: {
        iconColor: '#000000',
        color: '#000000',
        fontWeight: '300',
        fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
        fontSize: '28px',
        '::placeholder': {
          color: '#CFD7E0',
        },
      },
    },
  };

  elementsOptions: StripeElementsOptions = {
    locale: 'en',
  };

  toastr = inject(ToastrService);
  isLoader: boolean = false;
  constructor(
    private countryService: CountriesService,
    private userService: UserService,
    private cardService: CardService,
    private stripeService: StripeService,
    private authService: AuthService
  ) {
    this.userForm = new FormGroup({
      userName: new FormControl(null, [
        Validators.required,
        Validators.maxLength(20),
      ]),
      email: new FormControl(null, [Validators.required, Validators.email]),
      phone: new FormControl(null, [
        Validators.required,
        Validators.pattern('^[0-9]{10}$'),
        Validators.maxLength(10),
        Validators.minLength(10),
      ]),
      userProfile: new FormControl(null, [Validators.required]),
      country: new FormControl(null, [Validators.required]),
    });
  }
  ngOnInit() {
    this.countryService.getCountries().subscribe({
      next: (res) => {
        if (res.countries) {
          this.countryList = res.countries;
        }
      },
    });
    this.onSearch();
  }
  ngAfterViewChecked() {
    if (this.countryCode) {
      let temp_countrycode = document.getElementById(
        'countrycode'
      ) as HTMLInputElement;
      temp_countrycode.value = this.countryCode;
    }
  }
  preOnCountryChange(event: any) {
    console.log(event.target.value);
    let index = this.countryList.findIndex((X) => X._id == event.target.value);
    if (index != -1) {
      this.onCountryChange(this.countryList[index]);
    }
  }
  onCountryChange(country: Country) {
    this.selectedCountry = country;
    this.countryCode = country.countryCallCode;
  }
  onSortByChange(event: any) {
    this.sortMethod = event.target.value;
    this.onSearch();
  }
  onFileChange(event: any) {
    this.formdata.append('userProfile', 'sifiv');
    let files = event.target.files;
    let length = files.length;
    if (files && length) {
      if (
        event.target.files[0].type != 'image/png' &&
        event.target.files[0].type != 'image/jpeg'
      ) {
        this.toastr.warning(
          `${event.target.files[0].type} is not supported Upload Image/png`,
          'Warning',
          environment.TROASTR_STYLE
        );
      } else {
        if (
          event.target.files[0].size < 4000000) {
          this.formdata.delete('userProfile');
          this.formdata.set('userProfile', event.target.files[0]);
        } else {
          this.toastr.warning(
            'Upload file size is too large',
            'Warning',
            environment.TROASTR_STYLE
          );
        }
      }
    }
  }
  onAddUser() {
    this.isLoader = true;
    this.editMode = false;
    this.formdata.append('userName', this.userForm.get('userName')?.value);
    this.formdata.append('email', this.userForm.get('email')?.value);
    this.formdata.append('phone', this.userForm.get('phone')?.value);
    this.formdata.append('country', this.selectedCountry._id!);
    this.userService.postUser(this.formdata).subscribe({
      next: (res) => {
        if (res.user) {
          this.toastr.success(
            `User Added Successfully`,
            'Success',
            environment.TROASTR_STYLE
          );
          this.userForm.reset();
          this.formdata = new FormData();
          this.userForm.reset();
          this.onSearch();
          this.isLoader = false;
        }
      },
    });
  }
  onUpdateUser() {
    let temp_username = document.getElementById('userName') as HTMLInputElement;
    let temp_email = document.getElementById('email') as HTMLInputElement;
    let temp_phone = document.getElementById('phone') as HTMLInputElement;
    let temp_countrycode = document.getElementById(
      'countrycode'
    ) as HTMLInputElement;
    this.formdata.append('userName', temp_username.value);
    this.formdata.append('email', temp_email.value);
    this.formdata.append('phone', temp_phone.value);
    this.countryList.forEach((element) => {
      if (element.countryCallCode == temp_countrycode.value) {
        this.formdata.append('country', element._id!);
      }
    });
    if (this.userForm.dirty) {
      this.userService.updateUser(this.formdata).subscribe({
        next: (res) => {
          if (res.message) {
            this.toastr.success(
              `User Updated`,
              'Success',
              environment.TROASTR_STYLE
            );
            this.onSearch();
            this.editMode = false;
            this.userForm.reset();
            this.formdata = new FormData();
          }
        },
      });
    } else {
      this.toastr.info(
        'No Changes Has Been Made',
        'Info',
        environment.TROASTR_STYLE
      );
    }
  }
  onSearchInputChange(event: any) {
    this.searchInput = event.target.value;
    this.onSearch();
  }
  onSearch() {
    this.userService
      .getUsers(this.searchInput, this.currentPage, this.sortMethod)
      .subscribe({
        next: (res) => {
          if (res.users) {
            this.usersList = res.users;
          }
        },
      });
  }
  cardDetails(user: UserGet) {
    this.isLoader = true;
    let cardModal = new bootstrap.Modal(
      document.getElementById('cardModal') as HTMLElement
    );
    cardModal.show();
    // console.log(user.customerId)
    this.cardService.getCards(user.customerId).subscribe({
      next: (res) => {
        console.log(res.data)
        this.cardList = res.data;
        this.isLoader = false;
      },
      error: (err) => {
        this.isLoader = false;
        this.toastr.error(
          `Unable to Fetch data:- ${err.message}`,
          'Error',
          environment.TROASTR_STYLE
        );
      },
    });
    this.customerId = user.customerId;
  }
  onEdit(user: UserGet) {
    this.editMode = true;
    let modal = new bootstrap.Modal(
      document.getElementById('staticBackdrop') as HTMLElement
    );
    modal.show();
    this.userForm.reset();
    let temp_username = document.getElementById('userName') as HTMLInputElement;
    let temp_email = document.getElementById('email') as HTMLInputElement;
    let temp_phone = document.getElementById('phone') as HTMLInputElement;
    let temp_UserProfile = document.getElementById(
      'selectedUserProfile'
    ) as HTMLElement;
    let temp_countrycode = document.getElementById(
      'countrycode'
    ) as HTMLInputElement;
    let temp_country = document.getElementById('country') as HTMLSelectElement;
    temp_username.value = user.userName;
    temp_email.value = user.email;
    temp_phone.value = user.phone.toString();
    temp_countrycode.value = user.countryCode;
    temp_UserProfile.innerText = user.userProfile.slice(
      21,
      user.userProfile.length
    );
    for (let i = 0; i < this.countryList.length; i++) {
      if (this.countryList[i].countryName == user.countryName) {
        temp_country.selectedIndex = i + 1;
      } else {
        continue;
      }
    }
    this.formdata.append('id', user._id);
    this.formdata.append('olduserProfile', user.userProfile);
  }
  onDelete(user: UserGet) {
    this.isLoader = true;
    if (confirm('Are you sure you want to delete this user?')) {
      this.userService.deleteUser(user._id, user.customerId).subscribe({
        next: (res) => {
          if (res.message) {
            this.onSearch();
            this.toastr.success(
              'User Deleted Successfully',
              'Success',
              environment.TROASTR_STYLE
            );
            this.isLoader = false;
          }
        },
      });
    } else {
      return;
    }
  }
  onNextPage() {
    if (this.usersList.length < 10) {
      this.toastr.warning(
        `Already on last page`,
        'Warning',
        environment.TROASTR_STYLE
      );
    } else {
      this.currentPage = this.currentPage + 1;
      this.onSearch();
    }
  }
  onPreviousPage() {
    if (this.currentPage > 0) {
      this.currentPage = this.currentPage - 1;
      this.onSearch();
    } else {
      this.toastr.warning(
        `Already on first page`,
        'Warning',
        environment.TROASTR_STYLE
      );
    }
  }
  onClickAddUser() {
    this.editMode = false;
    this.userForm.reset();
    let modal = new bootstrap.Modal(
      document.getElementById('staticBackdrop') as HTMLElement
    );
    modal.show();
  }
  onActionSelect(event: any, user: UserGet) {
    switch (event.target.value) {
      case 'CardDetails':
        this.cardDetails(user);
        break;
      case 'Edit':
        this.onEdit(user);
        break;
      case 'Delete':
        this.onDelete(user);
        break;
    }
    event.target.selectedIndex = 0;
  }
  OnAddCard(token: any) {
    this.isLoader = true;
    const postCard: any = { customerId: this.customerId, token };
    this.cardService.postCard(postCard).subscribe({
      next: (res) => {
        if (res.card) {
          this.toastr.success(
            'Card Added Successfully',
            'Success',
            environment.TROASTR_STYLE
          );
          this.cardList.push(res.card);
          this.isLoader = false;
        }
      },
    });
  }
  deleteCard(index: number) {
    this.isLoader = true;
    let cardId = this.cardList[index].id;
    this.cardService.deleteCard(cardId, this.customerId).subscribe({
      next: (res) => {
        if (res.message) {
          this.toastr.success(
            'Card Deleted Successfully',
            'Success',
            environment.TROASTR_STYLE
          );
          this.cardList = this.cardList
            .slice(0, index)
            .concat(this.cardList.slice(index + 1));
          this.isLoader = false;
        }
      },
    });
  }
  setCardAsDefault(index: number) {
    this.isLoader = true;
    let cardId = this.cardList[index].id;
    let card = this.cardList[index];
    this.cardService.setCardAsDefault(cardId, this.customerId).subscribe({
      next: (res) => {
        this.toastr.info(
          `new Default card is:- XXXX XXXX XXXX ${card.last4}`,
          'Info',
          environment.TROASTR_STYLE
        );
        this.cardList = this.cardList
          .slice(0, index)
          .concat(this.cardList.slice(index + 1));
        this.cardList = [card, ...this.cardList];
        this.isLoader = false;
      },
      error: (err) => {
        this.isLoader = false;
        this.toastr.error(
          `Unable to Fetch data:- ${err.message}`,
          'Error',
          environment.TROASTR_STYLE
        );
      },
    });
  }
  OnChangeWantToAddCard() {
    this.wantToAddCard = !this.wantToAddCard;
  }
  createToken(): void {
    this.stripeService.createToken(this.card.element).subscribe({
      next: (result) => {
        if (result.token) {
          this.OnAddCard(result.token);
        } else if (result.error) {
          this.toastr.error(
            result.error.message,
            'Error',
            environment.TROASTR_STYLE
          );
        }
        this.wantToAddCard = false;
      },
      error: (err) => {
        this.toastr.error(
          `Unable to Fetch data:- ${err.message}`,
          'Error',
          environment.TROASTR_STYLE
        );
      },
    });
  }
}
