export interface Card {
    _id?: string,
    cardNumber: number,
    expiryDate: Date,
    cvv: number,
    cardHolderName: string
}