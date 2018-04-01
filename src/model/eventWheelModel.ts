import {GiftModel} from "./giftModel";
export class EventWheelModel {
    name: string = '';
    nameOfCompany: string = '';
    giftArray:any = [];
    dateCreate: any = {};
    isDone: boolean = true; // true: done
    linkImageWheel: string = '';
    linkPostFB: string = '';
    constructor () {
    }

    setValue = (name, nameOfCompany, dateCreate, isDone, linkImageWheel, giftArray, linkPostFB) => {
        this.name = name;
        this.nameOfCompany = nameOfCompany;
        this.dateCreate = dateCreate;
        this.isDone = isDone;
        this.linkImageWheel = linkImageWheel;
        this.giftArray = giftArray;
        this.linkPostFB = linkPostFB;
    }

    clone = () => {
        return JSON.parse(JSON.stringify(this));
    }
}