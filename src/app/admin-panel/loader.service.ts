import { Injectable, signal } from "@angular/core";
import { Subject } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class LoaderService {

    subject = new Subject<boolean>();
    loaderSignal =  signal<boolean>(false);

    constructor() { }

    OnStartLoader() {
        console.log("This OnStartLoader called")
        return this.subject.next(true);
    }

    OnStopLoader() {
        console.log("This OnStoptLoader called")
        return this.subject.next(false);
    }
}