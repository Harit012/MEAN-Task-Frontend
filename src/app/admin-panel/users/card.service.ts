import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Params } from '@angular/router';
import { Card } from './card.interface';

@Injectable({
  providedIn: 'root',
})
export class CardService {
  constructor(private http: HttpClient) {}

  postCard(card: Card) {
    return this.http.post<{ card: Card; error: string }>(
      'http://localhost:3000/admin/users/card',
      card,
      { withCredentials: true }
    );
  }

  deleteCard(cardId: string, userId: string) {
    let params: Params = {
      cardId: cardId,
      userId: userId,
    };
    return this.http.delete<{ message: string; error: string }>(
      `http://localhost:3000/admin/users/card`,
      {
        params: params,
        withCredentials: true,
      }
    );
  }
}
