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

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    StripeElementsDirective,
    StripeCardComponent,
    NgxStripeModule,
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
      country: new FormControl(null),
    });
  }
  ngOnInit() {
    this.countryService.getCountries().subscribe({
      next: (res) => {
        if (res.countries) {
          this.countryList = res.countries;
        } else if (res.varified == false) {
          this.authService.userLogOut();
        } else if (res.error) {
          this.toastr.error(`Error From Backend:- ${res.error}`, 'Error');
        }
      },
      error: (err) => {
        this.toastr.error(`Unable to Fetch data:- ${err.message}`, 'Error');
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
  onCountryChange(country: Country) {
    this.selectedCountry = country;
    this.countryCode = country.countryCallCode;
  }
  onSortByChange(event: any) {
    this.sortMethod = event.target.value;
    this.onSearch();
  }
  onFileChange(event: any) {
    if (event.target.files && event.target.files.length) {
      if (event.target.files[0].size < 4000000) {
        this.formdata.append('userProfile', event.target.files[0]);
      } else {
        this.toastr.warning('Upload file size is too large', 'Warning');
      }
    }
  }
  onAddUser() {
    this.editMode = false;
    this.formdata.append('userName', this.userForm.get('userName')?.value);
    this.formdata.append('email', this.userForm.get('email')?.value);
    this.formdata.append('phone', this.userForm.get('phone')?.value);
    this.formdata.append('country', this.selectedCountry._id!);
    this.userService.postUser(this.formdata).subscribe({
      next: (res) => {
        if (res.user) {
          this.toastr.success(`User Added Successfully`, 'Success');
          this.userForm.reset();
          this.formdata = new FormData();
          this.userForm.reset();
          this.onSearch();
        } else if (res.varified == false) {
          this.authService.userLogOut();
        } else if (res.error) {
          this.toastr.error(`Error From Backend:- ${res.error}`, 'Error');
        }
      },
      error: (err) => {
        this.toastr.error(`unable to Fetch data :- ${err.message}`);
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
    this.formdata.append('countryCode', temp_countrycode.value);
    this.countryList.forEach((element) => {
      if (element.countryCallCode == temp_countrycode.value) {
        this.formdata.append('country', element._id!);
      }
    });
    this.userService.updateUser(this.formdata).subscribe({
      next: (res) => {
        if (res.message) {
          this.toastr.success(`User Updated`, 'Success');
          this.onSearch();
          this.editMode = false;
          this.userForm.reset();
          this.formdata = new FormData();
        } else if (res.varified == false) {
          this.authService.userLogOut();
        } else if (res.error) {
          this.editMode = false;
          this.userForm.reset();
          this.formdata = new FormData();
          this.toastr.error(`Error From Backend:- ${res.error}`, 'Error');
        }
      },
      error: (err) => {
        this.toastr.error(`unable to Fetch data :- ${err.message}`);
      },
    });
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
          } else if (res.varified == false) {
            this.authService.userLogOut();
          } else if (res.error) {
            this.toastr.error(`Error From Backend:- ${res.error}`, 'Error');
          }
        },
        error: (err) => {
          this.toastr.error(`Unable to Fetch data:- ${err.message}`, 'Error');
        },
      });
  }
  cardDetails(user: UserGet) {
    let cardModal = new bootstrap.Modal(
      document.getElementById('cardModal') as HTMLElement
    ).show();
    // console.log(user.customerId)
    this.cardService.getCards(user.customerId).subscribe({
      next: (res) => {
        this.cardList = res.data;
      },
      error: (err) => {
        this.toastr.error(`Unable to Fetch data:- ${err.message}`, 'Error');
      },
    });
    this.customerId = user.customerId;
  }
  onEdit(user: UserGet) {
    console.log(user);
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
    this.formdata.append('id', user._id!);
    this.formdata.append('olduserProdile', user.userProfile);
  }
  onDelete(user: UserGet) {
    if (confirm('Are you sure you want to delete this user?')) {
      this.userService.deleteUser(user._id!, user.customerId!).subscribe({
        next: (res) => {
          if (res.message) {
            this.onSearch();
            this.toastr.success('User Deleted Successfully', 'Success');
          } else if (res.varified == false) {
            this.authService.userLogOut();
          } else if (res.error) {
            this.toastr.error(`Error From Backend:- ${res.error}`, 'Error');
          }
        },
        error: (err) => {
          this.toastr.error(`Unable to Fetch data:- ${err.message}`, 'Error');
        },
      });
    } else {
      return;
    }
  }
  isFieldInvalid(field: string): boolean {
    const control = this.userForm.get(field);
    return control
      ? control.invalid && (control.dirty || control.touched)
      : false;
  }
  onNextPage() {
    if (this.usersList.length < 10) {
      this.toastr.warning(`Already on last page`, 'Warning');
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
      this.toastr.warning(`Already on first page`, 'Warning');
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
  onActionSelect(event: any) {
    event.target.selectedIndex = 0;
  }
  OnAddCard(token: any) {
    const postCard: any = { customerId: this.customerId, token };
    console.log(postCard);
    this.cardService.postCard(postCard).subscribe({
      next:(res) => {
        if (res.card) {
          this.toastr.success('Card Added Successfully', 'Success');
          this.cardList.push(res.card);
        } 
        else if (res.varified == false) {
          this.authService.userLogOut();
        } 
        else if (res.error) {
          this.toastr.error(`Error From Backend:- ${res.error}`, 'Error');
        }
      },
      error:(err)=>{
        this.toastr.error(`Unable to Fetch data:- ${err.message}`, 'Error');
      }
    });
  }
  deleteCard(index: number) {
    let cardId = this.cardList[index].id;
    this.cardService.deleteCard(cardId!, this.customerId).subscribe({
      next:(res) => {
        if (res.message) {
          this.toastr.success('Card Deleted Successfully', 'Success');
          this.cardList = this.cardList
            .slice(0, index)
            .concat(this.cardList.slice(index + 1));
        } 
        else if (res.varified == false) {
          this.authService.userLogOut();
        } 
        else if (res.error) {
          this.toastr.error(`Error From Backend:- ${res.error}`, 'Error');
        }
      },
      error:(err)=>{
        this.toastr.error(`Unable to Fetch data:- ${err.message}`, 'Error');
      }
    });
  }
  setCardAsDefault(index: number) {
    let cardId = this.cardList[index].id;
    let card = this.cardList[index];
    this.cardService
      .setCardAsDefault(cardId!, this.customerId)
      .subscribe({
        next:(res) => {
          this.toastr.info(`new Default card is:- XXXX XXXX XXXX ${card.last4}`, 'Info');
            this.cardList = this.cardList
              .slice(0, index)
              .concat(this.cardList.slice(index + 1));
            this.cardList = [card, ...this.cardList];
          },
          error:(err)=>{
            this.toastr.error(`Unable to Fetch data:- ${err.message}`, 'Error');
          }
      });
  }
  OnChangeWantToAddCard() {
    this.wantToAddCard = !this.wantToAddCard;
  }
  createToken(): void {
    this.stripeService.createToken(this.card.element).subscribe({
      next:(result) => {
        if (result.token) {
          this.OnAddCard(result.token);
        } else if (result.error) {
          this.toastr.error(result.error.message, 'Error');
        }
        this.wantToAddCard = false;
      },
      error:(err)=>{
        this.toastr.error(`Unable to Fetch data:- ${err.message}`, 'Error');
      }
    });
  }
}
