import { CommonModule } from '@angular/common';
import { AfterViewChecked, Component, OnInit } from '@angular/core';
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

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './users.component.html',
  styleUrl: './users.component.css',
})
export class UsersComponent implements OnInit, AfterViewChecked {
  userForm: FormGroup;
  cardForm: FormGroup ;
  formdata: FormData = new FormData();
  selectedCountry!: Country;
  countryList: Country[] = [];
  cardList: Card[] = [];
  usersList: UserGet[] = [];
  countryCode!: string;
  searchInput: string = '';
  currentPage: number = 0;
  userOfCards!: string;
  editMode: boolean = false;
  wantToAddCard: boolean = false;

  constructor(
    private countryService: CountriesService,
    private userService: UserService,
    private cardService: CardService
  ) {
    this.userForm = new FormGroup({
      userName: new FormControl(null, [
        Validators.required,
        Validators.maxLength(10),
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
    this.cardForm = new FormGroup({
      cardNumber: new FormControl(null, [
        Validators.required,
        Validators.pattern('^[0-9]{16}$'),
        Validators.maxLength(16),
        Validators.minLength(16),
      ]),
      cardHolderName: new FormControl(null, [Validators.required]),
      expiryDate: new FormControl(null, [Validators.required,Validators.pattern('^[0-1]{1}[1-9]{1}\/[0-9]{2}$')]),
      cvv: new FormControl(null, [Validators.required,Validators.pattern('^[1-9]{3}$')]),
    });
  }
  ngOnInit() {
    this.countryService.getCountries().subscribe((res) => {
      if (res.countries) {
        this.countryList = res.countries;
      } else {
        alert(res.error);
      }
    });

    this.userService.getUsers('', this.currentPage).subscribe((res) => {
      if (res.users) {
        this.usersList = res.users;
      } else {
        alert(res.error);
      }
    });
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
  onFileChange(event: any) {
    if (event.target.files && event.target.files.length) {
      if (event.target.files[0].size < 4000000) {
        this.formdata.append('userProfile', event.target.files[0]);
      } else {
        return;
      }
    }
  }
  onAddUser() {
    this.editMode = false;
    this.formdata.append('userName', this.userForm.get('userName')?.value);
    this.formdata.append('email', this.userForm.get('email')?.value);
    this.formdata.append('phone', this.userForm.get('phone')?.value);
    this.formdata.append('country', this.selectedCountry._id!);
    this.userService.postUser(this.formdata).subscribe((res) => {
      if (res.user) {
        this.userForm.reset();
        this.formdata = new FormData();
        this.userForm.reset();
        this.onSearch();
      } else {
        alert(res.error);
      }
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
    this.userService.updateUser(this.formdata).subscribe((res) => {
      if (res.message) {
        this.onSearch();
        this.editMode = false;
        this.userForm.reset();
        this.formdata = new FormData();
      } else {
        alert(res.error);
        this.editMode = false;
        this.userForm.reset();
        this.formdata = new FormData();
      }
    });
  }
  onSearchInputChange(event: any) {
    this.searchInput = event.target.value;
    this.onSearch();
  }
  onSearch() {
    this.userService
      .getUsers(this.searchInput, this.currentPage)
      .subscribe((res) => {
        if (res.users) {
          this.usersList = res.users;
        } else {
          alert(res.error);
        }
      });
  }
  cardDetails(user: UserGet) {
    let cardModal = new bootstrap.Modal(
      document.getElementById('cardModal') as HTMLElement
    ).show();
    this.cardList = user.cards;
    this.userOfCards = user._id;
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
      this.userService.deleteUser(user._id!).subscribe((res) => {
        if (res.message) {
          this.onSearch();
        }
      });
    } else {
    }
  }
  isFieldInvalid(field: string): boolean {
    const control = this.userForm.get(field);
    return control
      ? control.invalid && (control.dirty || control.touched)
      : false;
  }
  isCardFieldInvalid(field: string): boolean {
    const control = this.cardForm.get(field);
    return control
      ? control.invalid && (control.dirty || control.touched)
      : false;
  }
  onNextPage() {
    if (this.usersList.length < 10) {
      alert('No more pages');
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
      alert('Already on first page');
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
  OnAddCard(){
    const postCard : Card= {...this.cardForm.value,userId:this.userOfCards}
    this.cardService.postCard(postCard).subscribe((res) => {
      if(res.card){
        this.cardList.push(res.card);
        this.cardForm.reset();
      }else{
        this.cardForm.reset();
        alert(res.error);
      }
    })
  }
  deleteCard(index: number) {
    let vardId = this.cardList[index]._id;
    this.cardService.deleteCard(vardId!, this.userOfCards!).subscribe((res) => {
      if (res.message) {
        console.log(res.message);
        this.cardList=this.cardList.slice(0, index).concat(this.cardList.slice(index+1));
        console.log(this.cardList)
      } else {
        alert(res.error);
      }
    });
  }
  OnChangeWantToAddCard(){
    this.wantToAddCard=!this.wantToAddCard;
  }
}
