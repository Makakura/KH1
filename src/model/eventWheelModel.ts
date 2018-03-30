import {GiftModel} from "./giftModel";
export class EventWheelModel {
    name: string = '';
    nameOfCompany: string = '';
    numberOfGift: GiftModel = new GiftModel();
    codeArray: any = [];
    dateCreate: any = {};
    isDone: boolean = true; // true: done
    constructor () {
        
    }
}