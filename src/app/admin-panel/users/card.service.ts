import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Params } from '@angular/router';
import { Card } from './card.interface';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CardService {
  constructor(private http: HttpClient) {}

  getCards(customerId:string){
    return this.http.get<{ data: Card[] }>(
      `https://api.stripe.com/v1/customers/${customerId}/cards`,
      {headers:{Authorization:`Bearer ${environment.STRIPE_SECRET_KEY}`} }
    )
  }

  postCard(card: Card) {
    return this.http.post<{ card: Card; error: string,varified: false }>(
      'http://localhost:3000/admin/users/card',
      card,
      { withCredentials: true }
    );
  }

  deleteCard(cardId: string, userId: string) {
    let params: Params = {
      cardId: cardId,
      customerId: userId,
    };
    return this.http.delete<{ message: string; error: string,varified: false }>(
      `http://localhost:3000/admin/users/card`,
      {
        params: params,
        withCredentials: true,
      }
    );
  }

  setCardAsDefault(cardId: string, customerId: string) {
    return this.http.post<{ card:Card; error: string,varified:boolean }>(
      'http://localhost:3000/admin/users/card/default',
      {
        cardId: cardId,
        customerId: customerId,
      },
      { withCredentials: true }
    );
  }


}
